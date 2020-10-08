export class PolarData {
    constructor(
        public alpha: number[],
        public cl: number[],
        public cd: number[],
        public cdp: number[],
        public cm: number[],
        public top_xtr: number[],
        public bot_xtr: number[],
    ) { }
}

export class WingPolar {
    constructor(
        public name: string,
        public reynolds: number,
        public ncrit: number,
        public mach: number,
        public url: string,
        public csv_url: string,
        public polar_data: PolarData,
    ) { }
}

export default class WingProfile {
    constructor(
        public name: string,
        public url: string,
        public polars: WingPolar[],
    ) { }
}

function test() {
    const polar_data = new PolarData(
        [1, 2], [1, 2], [1, 2], [1, 2],
        [1, 2], [1, 2], [1, 2],
    );

    console.log(polar_data.alpha);
}
