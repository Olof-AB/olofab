import { env } from '$env/dynamic/private';
import type { Station } from './types';

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const api_key = env.TRAFIKVERKET_API;
let changeid = 0;
let last_updated = new Date(0);
const stations = new Map<string, Station>();

interface TrvStation {
	Advertised: boolean;
	AdvertisedLocationName: string;
	AdvertisedShortLocationName: string;
	PrimaryLocationCode: string;
	CountryCode: string;
	CountyNo: number[];
	Deleted: boolean;
	Geometry: {
		SWEREF99TM: string;
		WGS84: string;
	};
	LocationSignature: string;
	PlatformLine: string[];
	Prognosticated: boolean;
	OfficialLocationName: string;
	ModifiedTime: string;
}

function fix_stationdata(station: TrvStation): Station {
	return {
		name: station['OfficialLocationName'],
		shortName: station['AdvertisedShortLocationName'],
		code: station['LocationSignature'],
		platform: station['PlatformLine'],
		prognosticated: station['Prognosticated'],
		modifiedTime: new Date(station['ModifiedTime'])
	};
}

async function get_stations_from_trv(): Promise<Station[]> {
	console.log('Downloading stations');

	const question = `<?xml version="1.0" ?>
    <REQUEST>
      <LOGIN authenticationkey="${api_key}" />
      <QUERY objecttype="TrainStation" namespace="rail.infrastructure" schemaversion="1.5" changeid="${changeid}">
        <FILTER>
        </FILTER>
      </QUERY>
    </REQUEST>`;

	// console.log(question);

	const trainResponse = await fetch('https://api.trafikinfo.trafikverket.se/v2/data.json', {
		method: 'POST',
		headers: { 'Content-Type': 'text/xml; charset=utf-8' },
		body: question
	});

	if (trainResponse.status !== 200) {
		console.log(trainResponse);
		return [];
	}

	const parsedResponse = await trainResponse.json();

	const stations = parsedResponse['RESPONSE']['RESULT'][0]['TrainStation'] as TrvStation[];
	const new_changeid = parsedResponse['RESPONSE']['RESULT'][0]['INFO']['LASTCHANGEID'];
	if (new_changeid && new_changeid !== changeid) {
		changeid = new_changeid;
	}

	return stations.map(fix_stationdata);
}

export async function getStationFromCode(code: string): Promise<Station | undefined> {
	if (Date.now() - last_updated.getTime() > CACHE_DURATION) {
		console.log('Updating stations');
		const newStations = await get_stations_from_trv();

		newStations.forEach((station) => {
			stations.set(station.code, station);
		});

		last_updated = new Date();
	}

	return stations.get(code);
}

export function stationNameFromCode(code: string): string {
	const station = stations.get(code);
	if (station) {
		return station.name;
	}
	return code;
}
