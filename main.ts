/*
 * m: メッセージ
 * ID: セッション固有の識別子
 * n, e: Signerの公開鍵
 *   n = pq (p, qは巨大な素数)
 *   e は、(p - 1)(q - 1)と互いに素な整数
 * Ej: Judgeの暗号化関数
 * k: セキュリティパラメータ
 */

function sign_protocol(m:  number,
                       ID: number,
                       n:  number,
                       e:  number,
                       Ej: (x: number) => number,
                       H:  (x: number) => number,
                       k:  number) : [number, number][]
{
    // iが1から始まるのでダミーを入れる
    let r: number[] = [0];
    let alpha: number[] = [0];
    let beta: number[]  = [0];

    let u: number[]  = [0];
    let v: number[]  = [0];

    let ms: number[] = [0];

    for (let i = 1; i <= 2 * k; i++) {
        r[i] = random_choose_int(n);
        alpha[i] = random_choose_int(10000);
        beta[i] = random_choose_int(10000);

        u[i] = Ej(concat(m, alpha[i]));
        v[i] = Ej(concat(ID, beta[i]));

        ms[i] = (Math.pow(r[i], e) * H(concat(u[i], v[i]))) % n
    }

    let S: number[] = random_set(2 * k);

    for (let i of S) {
        let x: number = ms[i];
        let y: number = ( Math.pow(r[i],  e) * H( concat(u[i], Ej(concat(ID, beta[i]))) ) ) % n;
        let valid = x == y;

        if (!valid) {
            console.log("invalid");
            console.log(x, y);
            return [[0, 0]];
        }
    }

    // Sの補集合
    let S_: number[] = complement(range(1, 2*k), S);

    let m_: number[] = S_.map((i: number) => ms[i]);
    let b: number = Math.pow( PI(m_), 1/e ) % n;

    let r_: number[] = S_.map(i => r[i]);
    let s: number = b / PI(r_) % n

    let T: [number, number][] = S_.map(i => [alpha[i], v[i]]);

    console.log("T:", T);
    return T;
}

function random_choose_int(n: number): number {
    let r = Math.random();
    return Math.floor(r * n);
}

function concat(x: number, y: number): number {
    /**
     * 二つの数値を結合する
     * 例； concat(3, 1) => 7
     *      concat(4, 1) => 9
     */
    let y_len = Math.floor(Math.log2(y)) + 1;
    return x << y_len | y;
}

function random_set(max: number): number[] {
    let S = range(1, max);

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
    return src.reduce((a,b) => a * b);
}

function range(start: number, end: number): number[] {
    let arr: number[] = Array.from(Array(end - start + 1), (v, k: number) => k + start);
    return arr;
}

function typeI(us: number[], is: number[]) {
}

function typeII(s: number, T: [[number, number]]) {
}

function assert<T extends { toString(): string }>(text: string, v1:T, v2:T) {
    if (v1.toString() !== v2.toString()) {
        console.log("wrong.", text, v1, v2);
    }
}

function test() {
    console.log("random_choose_int(10):", random_choose_int(10));
    assert("concat(3, 1):", concat(3, 1), 7);
    console.log("random_set(10):", random_set(10));
    assert("complement(range(10), range(5)):", complement(range(1, 10), range(1, 5)), [6, 7, 8, 9, 10]);
    assert("PI(range(1, 5)):", PI(range(1, 5)), 1*2*3*4*5);
    assert("range(1, 5)", range(1, 5), [1,2,3,4,5]);
}

function main() {
    const m = 100;
    const ID = 1;
    const n = 143;
    const e = 7;
    const Ej = (num: number) => num + 1;
    const H = (num: number) => num * 2;
    const k = 10;

    sign_protocol(m, ID, n, e, Ej, H, k);
}

//test();
main();
