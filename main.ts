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
                       k:  number)
{
    // iが1から始まるのでダミーを入れる
    let r: number[] = [0];
    let alpha: number[] = [0];
    let beta: number[]  = [0];

    let u: number[]  = [0];
    let v: number[]  = [0];

    let m_: number[] = [0];

    for (let i = 1; i <= 2 * k; i++) {
        r[i] = random_choose_int(n);
        alpha[i] = random_choose_int(10000);
        beta[i] = random_choose_int(10000);

        u[i] = Ej(concat(m, alpha[i]));
        v[i] = Ej(concat(ID, beta[i]));

        m_[i] = (Math.pow(r[i], e) * H(concat(u[i], v[i]))) % n
    }

    let S: number[] = random_set(2 * k);
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
    // range(1, k)
    let S: number[] = Array.from({length: max}, (k: number, v) => k+1);

    while (S.length > max / 2) {
        // ランダムに要素を取り除く
        let i = random_choose_int(S.length);
        S.splice(i, 1);
    }

    return S;
}

function typeI(us: number[], is: number[]) {
}

function typeII(s: number, T: [[number, number]]) {
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

main();
