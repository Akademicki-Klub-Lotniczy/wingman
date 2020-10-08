import axios, { AxiosResponse } from 'axios';
import BeautifulDom from 'beautiful-dom';
import HTMLElementData from 'beautiful-dom/dist/htmlelement';

import WingProfile, { PolarData, WingPolar } from './WingProfile';

const AIRFOILS_ROOT_URL = 'http://www.airfoiltools.com';
const ALL_AIRFOILS_URL = `${AIRFOILS_ROOT_URL}/search/airfoils`;

function round_to_2_decimal_places(n: number): number {
    return Math.round(n * 100) / 100;
}

function DownloadOnTheFly(filename: string, content: string) {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8, ${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

async function fetch_cors_anywhere(url: string): Promise<AxiosResponse> {
    const no_cors_url = `https://akl-cors-anywhere.herokuapp.com/${url}`;

    return axios.get(no_cors_url);
}

async function get_dom(url: string) {
    const response: AxiosResponse = await (fetch_cors_anywhere(url));
    return new BeautifulDom(response.data);
}

function get_all_anchors_including(dom: BeautifulDom, value_to_search_for: string) {
    const all_links = dom.querySelectorAll('a');

    const result = [];

    for (const link of all_links) {
        if (link.outerHTML === undefined) {
            continue;
        }

        if (link.outerHTML.includes(value_to_search_for)) {
            result.push(link);
        }
    }

    return result;
}

async function getWingPolar(polar_link_object: any): Promise<WingPolar> {
    const polar_link_url = `${AIRFOILS_ROOT_URL}${polar_link_object.getAttribute('href')}`;

    //                             get all the links             from the polar details      that point to the csv file
    const polar_csv_link_ending = get_all_anchors_including((await get_dom(polar_link_url)), '/polar/csv')[0].getAttribute('href');
    const polar_csv_link = `${AIRFOILS_ROOT_URL}${polar_csv_link_ending}`;
    const polar_name = polar_link_object.getAttribute('href').split('=')[1];

    /**
     * Parse polars CSV file.
     *
     * The file structure is:
     *  - Header: lines 1 - 9
     *  - Blank line 10
     *  - Polars data: lines 11 - 72 (probably always 72)
     */
    const polar_csv_content = (await fetch_cors_anywhere(polar_csv_link)).data;
    const polar_csv_lines: string[] = polar_csv_content.split('\n');

    /**
     * Parse the header
     */
    const polar_csv_header_lines = polar_csv_lines.slice(1, 9);

    const polar_csv_key_value: { [id: string]: string } = {};
    for (const line of polar_csv_header_lines) {
        const [key, value] = line.split(',');
        polar_csv_key_value[key] = value;
    }

    // console.log(polar_csv_key_value);

    const reynols_number: number = parseInt(polar_csv_key_value['Reynolds number'], 10);
    const ncrit: number = parseInt(polar_csv_key_value.Ncrit, 10);
    const mach: number = parseInt(polar_csv_key_value.Mach, 10);

    /**
     * Parse the plots data
     */

    const polar_csv_plots_header: string = polar_csv_lines[10];
    if (polar_csv_plots_header !== 'Alpha,Cl,Cd,Cdp,Cm,Top_Xtr,Bot_Xtr') {
        console.error(`Malformed CSV file. Check the CSV at ${polar_link_url}`);
    }

    const polar_csv_plots_data: string[] = polar_csv_lines.slice(11);

    // console.log(polar_csv_plots_data);

    const alphas: number[] = [];
    const cls: number[] = [];
    const cds: number[] = [];
    const cdps: number[] = [];
    const cms: number[] = [];
    const top_xtrs: number[] = [];
    const bot_xtrs: number[] = [];

    for (const plot_data_line of polar_csv_plots_data) {
        const [alpha, cl, cd, cdp, cm, top_xtr, bot_xtr] = plot_data_line.split(',').map((x) => parseFloat(x));

        alphas.push(alpha);
        cls.push(cl);
        cds.push(cd);
        cdps.push(cdp);
        cms.push(cm);
        top_xtrs.push(top_xtr);
        bot_xtrs.push(bot_xtr);
    }

    return new WingPolar(
        polar_name,
        reynols_number,
        ncrit,
        mach,
        polar_link_url,
        polar_csv_link,
        new PolarData(alphas, cls, cds, cdps, cms, top_xtrs, bot_xtrs),
    );
}

async function get_all_profile_polars(details_url: string): Promise<WingPolar[]> {
    const polars_links: any = get_all_anchors_including((await get_dom(details_url)), '/polar/details');

    const result_polars: WingPolar[] = [];

    for (const polar_link of polars_links) {
        const newWingPolar = await getWingPolar(polar_link);
        result_polars.push(newWingPolar);
        // break; // ONLY FOR TESTING
    }

    return result_polars;
}

export default async function DownloadWings(how_many_to_download: number, logging_callback: (log: string) => void) {
    console.log(how_many_to_download);

    const time_download_started = performance.now();

    const all_wings: WingProfile[] = [];

    const avg_single_wing_json_size_megs = 0.048;
    let wings_links: HTMLElementData[] = get_all_anchors_including((await get_dom(ALL_AIRFOILS_URL)), 'airfoil/details');

    if (!Number.isNaN(how_many_to_download)) {
        wings_links = wings_links.slice(0, how_many_to_download);
    }

    logging_callback(`Downloading ${wings_links.length} wings`);
    logging_callback(`Expecting an output file of size about ${avg_single_wing_json_size_megs * wings_links.length}MB`);

    let link_num = 0;

    /* Get a specific wing */
    for (const link of wings_links) {
        link_num += 1;
        const wing_profile_name = link.innerText;
        console.log(wing_profile_name);
        const wing_profile_url = `${AIRFOILS_ROOT_URL}${link.getAttribute('href')}`;

        const new_wing_profile = new WingProfile(
            wing_profile_name,
            wing_profile_url,
            await get_all_profile_polars(wing_profile_url),
        );

        /* Enter the wing details page */

        all_wings.push(new_wing_profile);
        const current_time = performance.now();

        const time_since_download_started_seconds = round_to_2_decimal_places((current_time - time_download_started) / 1000.0);
        const time_per_link = round_to_2_decimal_places(time_since_download_started_seconds / link_num);

        const time_left = time_per_link * (wings_links.length - link_num);
        const date = new Date(0);
        date.setSeconds(time_left); // specify value for SECONDS here
        const time_left_str = date.toISOString().substr(11, 8);

        logging_callback(`Download running for ${time_since_download_started_seconds} seconds`);
        logging_callback(`Average time to download a single wing is ${time_per_link} seconds`);
        logging_callback(`Estimated time left: ${time_left_str} (HH:MM:SS)`);
    }

    logging_callback('ALL DONE: Downloading...');

    // console.log(all_wings);

    DownloadOnTheFly('wings.json', JSON.stringify(all_wings));
}
