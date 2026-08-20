export class NonceTracker {
  constructor(initial = 0) { this.nonce = initial; }
  next() { return this.nonce++; }
  current() { return this.nonce; }
}
