export class SocketRateLimiter {
  constructor(maxPackets = 30, windowMs = 1000) {
    this.maxPackets = maxPackets;
    this.windowMs = windowMs;
    this.counts = new Map();
  }
  allow(socketId) {
    const now = Date.now();
    const record = this.counts.get(socketId) || { count: 0, resetTime: now + this.windowMs };
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + this.windowMs;
    }
    record.count++;
    this.counts.set(socketId, record);
    return record.count <= this.maxPackets;
  }
}
