const STR_LEN = 20;

type T_t = { alpha: number; v: number };
type signature_t = { s: number; T: T_t[] };
type encrypt_t = (x: number) => number;
type decrypt_t = (x: number) => number;
type hash_t = (x: number) => number;
/*
 * m: メッセージ
 * ID: セッション固有の識別子
 * n, e: Signerの公開鍵
 *   n = pq (p, qは巨大な素数)
 *   e は、(p - 1)(q - 1)と互いに素な整数
 * Ej: Judgeの暗号化関数
 * k: セキュリティパラメータ
 */

function sign_protocol({
  m,
  ID,
  n,
  e,
  Ej,
  H,
  k,
  d,
}: {
  m: number;
  ID: number;
  n: number;
  e: number;
  Ej: encrypt_t;
  H: hash_t;
  k: number;
  d: number;
}): {
  signature: signature_t;
  u_i: number;
} {
  let r: number[] = [];
  let alpha: number[] = [];
  let beta: number[] = [];

  let u: number[] = [];
  let v: number[] = [];

  let ms: number[] = [];

  for (let i of range(0, 2 * k)) {
    r[i] = random_choose_int(n);
    alpha[i] = random_choose_str();
    beta[i] = random_choose_str();

    u[i] = Ej(concat(m, alpha[i]));
    v[i] = Ej(concat(ID, beta[i]));

    let r_e_i = pow_mod(r[i], e, n) % n;
    let h_i = H(concat(u[i], v[i])) % n;
    ms[i] = (r_e_i * h_i) % n;
  }

  let S: number[] = random_set(2 * k);

  for (let i of S) {
    let x: number = ms[i];

    let r_e_i = pow_mod(r[i], e, n) % n;

    const v_i = Ej(concat(ID, beta[i]));
    const h_i = H(concat(u[i], v_i)) % n;
    let y: number = (r_e_i * h_i) % n;

    let valid = x == y;

    if (!valid) {
      console.log("invalid");
      console.log(x, y);
      const signature: signature_t = {
        s: 0,
        T: [{ alpha: alpha[0], v: v[0] }],
      };
      const u_i: number = u[0];
      return { signature, u_i };
    }
  }

  // Sの補集合
  let S_: number[] = complement(range(1, 2 * k), S);

  let m_: number[] = S_.map((i: number) => ms[i]);
  let b: number = pow_mod(PI_mod(m_, n), d, n);

  let r_: number[] = S_.map((i) => r[i]);
  let s: number = div_mod(b, PI_mod(r_, n), n);

  let T: T_t[] = S_.map((i) => ({ alpha: alpha[i], v: v[i] }));

  const signature: signature_t = { T, s };
  return { signature, u_i: u[1] };
}

function random_choose_int(n: number): number {
  let r = Math.random();
  return Math.floor(r * (n - 1)) + 1;
}

function random_choose_str(): number {
  let r: number;
  let max: number = Math.pow(2, STR_LEN) - 1;

  do {
    r = random_choose_int(max);
  } while (Math.ceil(Math.log2(r)) < STR_LEN);

  return r;
}

function concat(x: number, y: number): number {
  /**
   * 二つの数値を結合する
   * 例； concat(3, 1) => 7
   *      concat(4, 1) => 9
   */
  let y_len = Math.ceil(Math.log2(y)) + 1;
  return (x << y_len) | y;
}

function random_set(max: number): number[] {
  let S = range(0, max);

  while (S.length > max / 2) {
    // ランダムに要素を取り除く
    let i = random_choose_int(S.length);
    S.splice(i, 1);
  }

  return S;
}

/**
 * 補集合
 * populationのうち、
 * srcに入っていないものを返す
 */
function complement(population: number[], src: number[]): number[] {
  // コピー
  let set = population.slice();

  for (let i of src) {
    let idx = set.indexOf(i);
    if (idx >= 0) {
      set.splice(idx, 1);
    }
  }

  return set;
}

function PI(src: number[]): number {
  return src.reduce((a, b) => a * b);
}

function PI_mod(src: number[], m: number): number {
  const src_mod = src.map((n) => n % m);
  return src_mod.reduce((a, b) => (a * b) % m);
}

function div_mod(a: number, b: number, m: number): number {
  const b_inv = mod_inverse(b, m);
  return (a * b_inv) % m;
}

function pow_mod(a: number, b: number, m: number): number {
  let x = a,
    y = b,
    res = 1;
  x = x % m;
  if (x === 0) {
    console.log(0);
    return 0;
  }

  while (y > 0) {
    if ((y & 1) === 1) {
      res = (res * x) % m;
    }

    y = y >> 1;
    x = (x * x) % m;
  }

  return res;
}

function mod_inverse(a: number, m: number): number {
  let [g, x, y] = gcd_extended(a, m);
  x = x % m;
  if (x < 0) {
    x = x + m;
  }
  return x;
}

function gcd_extended(a: number, b: number): [number, number, number] {
  let prevx = 1,
    x = 0,
    prevy = 0,
    y = 1;
  while (b > 0) {
    const q = Math.floor(a / b);
    [x, prevx] = [prevx - q * x, x];
    [y, prevy] = [prevy - q * y, y];
    [a, b] = [b, a % b];
  }
  return [a, prevx, prevy];
}

function range(start: number, end: number): number[] {
  let arr: number[] = Array.from(
    Array(end - start),
    (v, k: number) => k + start
  );
  return arr;
}

function verify_signature(
  m: number,
  n: number,
  e: number,
  sigunature: signature_t,
  Ej: encrypt_t,
  H: hash_t
): { s1: number; s2: number } {
  const { s, T } = sigunature;
  const s1 = pow_mod(s, e, n);
  const arr = T.map(({ alpha, v }) => H(concat(Ej(concat(m, alpha)), v)));
  const s2 = PI_mod(arr, n);

  return { s1, s2 };
}

function typeI(u_i: number, Dj: decrypt_t): number {
  const decrypted = Dj(u_i);
  const m = decrypted >> (STR_LEN + 1);
  return m;
}

function typeII(signature: signature_t, Dj: decrypt_t): number {
  const decrypted = Dj(signature.T[0].v);
  const ID = decrypted >> (STR_LEN + 1);
  return ID;
}

function assert<T extends { toString(): string }>(text: string, v1: T, v2: T) {
  if (v1.toString() !== v2.toString()) {
    console.log("wrong.", text, v1, v2);
  }
}

function check<T extends { toString(): string }>(text: string, v1: T, v2: T) {
  let t = "";
  if (v1.toString() === v2.toString()) {
    t = "ok.";
  } else {
    t = "wrong.";
  }
  console.log(text, t, v1, v2);
}

function test() {
  // テストはガバガバになりました。各自直してください。
  console.log("random_choose_int(10):", random_choose_int(10));
  assert("concat(3, 1):", concat(3, 1), 7);
  console.log("random_set(10):", random_set(10));
  assert(
    "complement(range(10), range(5)):",
    complement(range(1, 10), range(1, 5)),
    [5, 6, 7, 8, 9]
  );
  assert("PI(range(1, 5)):", PI(range(1, 5)), 1 * 2 * 3 * 4);
  assert(
    "PI_mod(range(1, 5), 13):",
    PI_mod(range(1, 5), 13),
    (1 * 2 * 3 * 4) % 13
  );
  assert("div_mod(9, 4, 13):", div_mod(9, 4, 13), 12);
  assert("pow_mod(9, 4, 13):", pow_mod(9, 4, 13), 9);
  assert("mod_inverse(4, 13):", mod_inverse(4, 13), 10);
  assert("range(1, 5)", range(1, 5), [1, 2, 3, 4]);
}

function main() {
  const m = 120;
  const ID = 456;
  const p = 17;
  const q = 11;

  const n = p * q;
  console.log("n = ", n);

  const e = 7;
  const d = mod_inverse(e, (p - 1) * (q - 1));

  const k = 1;

  //   const c = pow_mod(m, d, n);
  //   console.log(c);
  //   const new_m = pow_mod(c, e, n);
  //   console.log(new_m);

  const Ej = (num: number) => num ** 2;
  const Dj = (num: number) => Math.floor(num ** (1 / 2));

  const H = (num: number) => (num * 2 + 1) ** 2;

  const { signature, u_i } = sign_protocol({ m, ID, n, e, Ej, H, k, d });
  console.log("s =", signature.s);

  const { s1, s2 } = verify_signature(m, n, e, signature, Ej, H);
  check("signature: ", s1, s2);
  check("typeI:     ", typeI(u_i, Dj), m);
  check("typeII:    ", typeII(signature, Dj), ID);
}

test();
main();
