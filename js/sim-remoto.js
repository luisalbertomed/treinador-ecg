/* ==========================================================================
   CONEXÃO MONITOR ↔ CONTROLE REMOTO do Simulador ACLS
   Dois caminhos em paralelo:
   - BroadcastChannel: outra janela no mesmo aparelho (funciona sem internet);
   - PeerJS (WebRTC): celular ou tablet. O servidor público do PeerJS só faz o
     primeiro contato; depois os dados vão direto entre os aparelhos.
   Servidor PeerJS próprio: acrescente ?peer=host:porta[/caminho] à URL.
   Mensagens do monitor: catalogo, estado, log, toast, avaliacao.
   Mensagens do controle: ola, ping, cmd.
   ========================================================================== */
const SimRemoto = (function(){
  'use strict';
  const PREFIXO = 'treinador-ecg-sim-';
  const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

  function novoCodigo(){
    const a = new Uint32Array(6); crypto.getRandomValues(a);
    let s = ''; for (const x of a) s += ALFABETO[x % ALFABETO.length];
    return s;
  }
  function normalizarCodigo(c){ return String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); }
  function opcoesPeer(){
    const o = {debug: 0, config: {iceServers: [{urls: 'stun:stun.l.google.com:19302'}, {urls: 'stun:global.stun.twilio.com:3478'}]}};
    const q = new URLSearchParams(location.search).get('peer');
    if (q){
      const m = q.match(/^([^:/]+)(?::(\d+))?(\/.*)?$/);
      if (m){ o.host = m[1]; o.port = Number(m[2] || (location.protocol === 'https:' ? 443 : 80)); o.path = m[3] || '/'; o.secure = location.protocol === 'https:'; }
    }
    return o;
  }
  function temPeer(){ return typeof Peer === 'function'; }

  /* ---------- Monitor (anfitrião) ---------- */
  function Anfitriao(codigo, aoMsg, aoStatus){
    const self = this;
    this.codigo = codigo; this.conns = new Set(); this.locais = new Map(); this.p2p = 'conectando'; this.fechado = false;
    try {
      this.bc = new BroadcastChannel(PREFIXO + codigo);
      this.bc.onmessage = e => {
        const d = e.data || {};
        if (!d.de || !['ola', 'ping', 'cmd'].includes(d.tipo)) return;
        const novo = !self.locais.has(d.de);
        self.locais.set(d.de, Date.now());
        if (novo) self.status();
        aoMsg(d, 'bc');
      };
    } catch (e) { this.bc = null; }
    this.status = () => aoStatus({p2p: self.p2p, clientes: self.clientes()});
    this.iniciarPeer = () => {
      if (self.fechado) return;
      if (!temPeer()){ self.p2p = 'indisponivel'; self.status(); return; }
      if (self.peer){ try { self.peer.destroy(); } catch (e) {} }
      self.p2p = 'conectando'; self.status();
      const peer = self.peer = new Peer(PREFIXO + codigo, opcoesPeer());
      peer.on('open', () => { self.p2p = 'pronto'; self.status(); });
      peer.on('connection', conn => {
        conn.on('open', () => { self.conns.add(conn); self.status(); });
        conn.on('data', d => { if (d && typeof d === 'object') aoMsg(d, conn); });
        const sai = () => { self.conns.delete(conn); self.status(); };
        conn.on('close', sai); conn.on('error', sai);
      });
      peer.on('disconnected', () => {
        if (self.fechado || peer.destroyed) return;
        self.p2p = 'conectando'; self.status();
        setTimeout(() => { if (!peer.destroyed && peer.disconnected) peer.reconnect(); }, 3000);
      });
      peer.on('error', err => {
        if (self.fechado) return;
        if (err.type === 'unavailable-id'){ self.p2p = 'codigo-em-uso'; self.status(); return; }
        if (['network', 'server-error', 'socket-error', 'socket-closed', 'browser-incompatible', 'ssl-unavailable'].includes(err.type)){
          self.p2p = 'indisponivel'; self.status();
          clearTimeout(self.retentar); self.retentar = setTimeout(self.iniciarPeer, 8000);
        }
      });
    };
    this.iniciarPeer();
    this.vigia = setInterval(() => {
      const agora = Date.now(); let mudou = false;
      for (const [id, t] of self.locais) if (agora - t > 6000){ self.locais.delete(id); mudou = true; }
      if (mudou) self.status();
    }, 2000);
  }
  Anfitriao.prototype.clientes = function(){ let n = this.locais.size; for (const c of this.conns) if (c.open) n++; return n; };
  Anfitriao.prototype.enviar = function(msg){
    if (this.bc) this.bc.postMessage(msg);
    for (const c of this.conns) if (c.open) try { c.send(msg); } catch (e) {}
  };
  Anfitriao.prototype.responder = function(destino, msg){
    if (destino === 'bc'){ if (this.bc) this.bc.postMessage(msg); }
    else if (destino && destino.open) try { destino.send(msg); } catch (e) {}
  };
  Anfitriao.prototype.fechar = function(){
    this.fechado = true; clearInterval(this.vigia); clearTimeout(this.retentar);
    if (this.bc) this.bc.close();
    if (this.peer) try { this.peer.destroy(); } catch (e) {}
  };

  /* ---------- Controle (cliente) ---------- */
  function Cliente(codigo, aoMsg, aoStatus){
    const self = this;
    this.codigo = codigo; this.id = Math.random().toString(36).slice(2, 10); this.via = null; this.fechado = false;
    this.estado = 'procurando';
    const status = (e, det) => { self.estado = e; aoStatus(e, self.via, det); };
    const receber = (d, via) => {
      if (!d || !['catalogo', 'estado', 'log', 'toast', 'avaliacao', 'avaliacaoFechada'].includes(d.tipo)) return;
      if (self.via !== via){ self.via = via; status('conectado'); }
      self.ultimo = Date.now();
      aoMsg(d);
    };
    try {
      this.bc = new BroadcastChannel(PREFIXO + codigo);
      this.bc.onmessage = e => { if (self.via !== 'p2p') receber(e.data, 'bc'); };
      this.bc.postMessage({tipo: 'ola', de: this.id});
    } catch (e) { this.bc = null; }
    this.conectarPeer = () => {
      if (self.fechado || self.via === 'bc') return;
      if (!temPeer()){ status('sem-p2p'); return; }
      if (!self.peer || self.peer.destroyed){
        self.peer = new Peer(opcoesPeer());
        self.peer.on('error', err => {
          if (self.fechado) return;
          if (err.type === 'peer-unavailable') status('nao-encontrado');
          else if (['network', 'server-error', 'socket-error', 'socket-closed'].includes(err.type)) status('sem-internet');
          self.agendar();
        });
        self.peer.on('disconnected', () => { if (!self.fechado && !self.peer.destroyed) setTimeout(() => { try { self.peer.reconnect(); } catch (e) {} }, 2000); });
        self.peer.on('open', () => self.abrirConexao());
      } else if (self.peer.open) self.abrirConexao();
    };
    this.abrirConexao = () => {
      if (self.fechado || self.via === 'bc') return;
      if (self.conn) try { self.conn.close(); } catch (e) {}
      const conn = self.conn = self.peer.connect(PREFIXO + codigo, {reliable: true, serialization: 'json'});
      conn.on('open', () => { conn.send({tipo: 'ola', de: self.id}); });
      conn.on('data', d => receber(d, 'p2p'));
      conn.on('close', () => { if (self.conn === conn){ self.via = null; status('desconectado'); self.agendar(); } });
      conn.on('error', () => { if (self.conn === conn){ self.via = null; status('desconectado'); self.agendar(); } });
    };
    this.agendar = () => { clearTimeout(self.t); if (!self.fechado) self.t = setTimeout(self.conectarPeer, 4000); };
    /* Dá 1,2 s para uma janela no mesmo aparelho responder; senão, vai de P2P. */
    this.tInicio = setTimeout(() => { if (!self.via) self.conectarPeer(); }, 1200);
    this.batida = setInterval(() => {
      if (self.via === 'bc') self.bc.postMessage({tipo: 'ping', de: self.id});
      else if (self.via === 'p2p' && self.conn && self.conn.open) self.conn.send({tipo: 'ping', de: self.id});
      if (self.via && Date.now() - (self.ultimo || 0) > 7000){
        const antes = self.via; self.via = null; status('desconectado');
        if (antes === 'bc') self.bc.postMessage({tipo: 'ola', de: self.id});
        self.agendar();
      }
    }, 2000);
    status('procurando');
  }
  Cliente.prototype.enviar = function(msg){
    msg.de = this.id;
    if (this.via === 'bc' && this.bc){ this.bc.postMessage(msg); return true; }
    if (this.via === 'p2p' && this.conn && this.conn.open){ try { this.conn.send(msg); return true; } catch (e) {} }
    return false;
  };
  Cliente.prototype.fechar = function(){
    this.fechado = true; clearTimeout(this.t); clearTimeout(this.tInicio); clearInterval(this.batida);
    if (this.bc) this.bc.close();
    if (this.peer) try { this.peer.destroy(); } catch (e) {}
  };

  return {Anfitriao, Cliente, novoCodigo, normalizarCodigo};
})();
