import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CurrentWeatherCard from 'components/CurrentWeatherCard/CurrentWeatherCard';
import DayCard from 'components/DayCard/DayCard';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Skeleton from '@material-ui/lab/Skeleton';

axios.defaults.baseURL = 'http://dataservice.accuweather.com';
const { CancelToken } = axios;

const useStyles = makeStyles({
	root: {
		alignContent: 'start',
		height: '100%',
	},
	paperWrapper: {
		padding: '20px',
		height: '100%',
		backgroundColor: '#ebebeb',
	},
	autocompleteWrapper: {
		marginBottom: '50px',
	},
	currentWeatherPhrase: {
		margin: '50px 0',
	},
});

const telAvivOption = {
	Version: 1,
	Key: '215854',
	Type: 'City',
	Rank: 31,
	LocalizedName: 'Tel Aviv',
	Country: { ID: 'IL', LocalizedName: 'Israel' },
	AdministrativeArea: { ID: 'TA', LocalizedName: 'Tel Aviv' },
};

export default function WeatherDetails() {
	const classes = useStyles();
	const [open, setOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchTermChangeReason, setSearchTermChangeReason] = useState('');
	const [options, setOptions] = useState([]);
	const [selectedOption, setSelectedOption] = useState(null);
	const [currentWeather, setCurrentWeather] = useState(null);
	const [forecast, setForecast] = useState([]);
	const [loading, setLoading] = useState(false);
	const [currentWeatherLoading, setCurrentWeatherLoading] = useState(false);
	const [forecastLoading, setForecastLoading] = useState(false);

	// autocomplete fetch
	useEffect(() => {
		if (
			searchTerm.length === 0 ||
			['reset', 'clear'].includes(searchTermChangeReason)
		) {
			return;
		}
		setLoading(true);
		const source = CancelToken.source();
		(async () => {
			try {
				const result = await axios({
					url: '/locations/v1/cities/autocomplete',
					method: 'GET',
					cancelToken: source.token,
					params: {
						apikey: 'ZykvKfNQRGnZSPw9DdilEwqEzni3OBqb',
						q: searchTerm,
					},
				});
				setOptions(result.data || []);
				setLoading(false);
			} catch (e) {
				setLoading(false);
				console.error(e);
			}
		})();
		return () => source.cancel();
	}, [searchTerm, searchTermChangeReason]);

	// current weather fetch
	useEffect(() => {
		if (!selectedOption) {
			return;
		}
		setCurrentWeatherLoading(true);
		const source = CancelToken.source();
		(async () => {
			try {
				const result = await axios({
					url: `/currentconditions/v1/${selectedOption.Key}`,
					method: 'GET',
					cancelToken: source.token,
					params: {
						apikey: 'ZykvKfNQRGnZSPw9DdilEwqEzni3OBqb',
					},
				});
				setCurrentWeather(result.data[0] || null);
				setCurrentWeatherLoading(false);
			} catch (e) {
				setCurrentWeatherLoading(false);
				console.error(e);
			}
		})();
		return () => source.cancel();
	}, [selectedOption]);

	// forecast fetch
	useEffect(() => {
		if (!selectedOption) {
			return;
		}
		setForecastLoading(true);
		const source = CancelToken.source();
		(async () => {
			try {
				const result = await axios({
					url: `/forecasts/v1/daily/5day/${selectedOption.Key}`,
					method: 'GET',
					cancelToken: source.token,
					params: {
						apikey: 'ZykvKfNQRGnZSPw9DdilEwqEzni3OBqb',
						metric: true,
					},
				});
				setForecast(result.data.DailyForecasts || null);
				setForecastLoading(false);
			} catch (e) {
				setForecastLoading(false);
				console.error(e);
			}
		})();
		return () => source.cancel();
	}, [selectedOption]);

	// default weather fetch
	useEffect(() => {
		// setCurrentWeatherLoading(true);
		// const source = CancelToken.source();

		setSelectedOption(telAvivOption);
		// (async () => {
		// 	try {
		// 		// const result = await axios({
		// 		// 	url: `/currentconditions/v1/${selectedOption.Key}`,
		// 		// 	method: 'GET',
		// 		// 	cancelToken: source.token,
		// 		// 	params: {
		// 		// 		apikey: 'ZykvKfNQRGnZSPw9DdilEwqEzni3OBqb',
		// 		// 	},
		// 		// });
		// 		// setCurrentWeather(result.data[0] || null);

		// 				// 		await new Promise(resolve =>
		// // 			setTimeout(() => {
		// // 				setSelectedOption(telavivLocationInfoMock[0]);
		// // 			}, 3000)
		// // 		);

		// // 		// setCurrentWeatherLoading(false);

		// 		// setLoading(false);
		// 	} catch (e) {
		// 		setCurrentWeatherLoading(false);
		// 		console.error(e);
		// 	}
		// })();
		// return () => source.cancel();
	}, []);

	const handleInputChange = (e, term, reason) => {
		setSearchTerm(term);
		setSearchTermChangeReason(reason);
	};

	const handleSelect = (e, option) => {
		option && setSelectedOption(option);
	};

	return (
		<Grid container justify='center' className={classes.root}>
			<Grid
				container
				item
				justify='center'
				xs={12}
				className={classes.autocompleteWrapper}>
				<Autocomplete
					id='asynchronous-demo'
					style={{ width: 300 }}
					open={open}
					onOpen={() => {
						setOpen(true);
					}}
					onClose={() => {
						setOpen(false);
					}}
					onInputChange={handleInputChange}
					onChange={handleSelect}
					getOptionSelected={(option, value) =>
						option.name === value.name
					}
					getOptionLabel={option => option.LocalizedName}
					options={options}
					loading={loading}
					renderInput={params => (
						<TextField
							{...params}
							label='Asynchronous'
							variant='outlined'
							InputProps={{
								...params.InputProps,
								endAdornment: (
									<React.Fragment>
										{loading ? (
											<CircularProgress
												color='inherit'
												size={20}
											/>
										) : null}
										{params.InputProps.endAdornment}
									</React.Fragment>
								),
							}}
						/>
					)}
				/>
			</Grid>
			<Grid item xs={10}>
				<Paper className={classes.paperWrapper}>
					<Grid container>
						<Grid container item xs={12}>
							<Grid item xs={12} sm={6}>
								<CurrentWeatherCard
									loading={currentWeatherLoading}
									location={
										selectedOption &&
										selectedOption.LocalizedName
									}
									temperature={
										currentWeather &&
										currentWeather.Temperature.Metric.Value
									}
									icon={
										currentWeather &&
										currentWeather.WeatherIcon
									}
								/>
							</Grid>
							<Grid
								container
								item
								xs={12}
								sm={6}
								justify='flex-end'>
								favorites
							</Grid>
						</Grid>
						<Grid container item justify='center' xs={12}>
							{currentWeatherLoading ? (
								<Skeleton
									animation='wave'
									height={72}
									width='40%'
									style={{ margin: '50px 0' }}
								/>
							) : (
								<Typography
									variant='h2'
									className={classes.currentWeatherPhrase}>
									{currentWeather &&
										currentWeather.WeatherText}
								</Typography>
							)}
						</Grid>
						<Grid
							container
							item
							justify='center'
							xs={12}
							spacing={2}>
							{[...Array(5)].map((_, i) => {
								return (
									<Grid
										item
										xs={12}
										sm={6}
										md={2}
										key={`day_${i}`}>
										<DayCard
											loading={forecastLoading}
											data={forecast && forecast[i]}
										/>
									</Grid>
								);
							})}
						</Grid>
					</Grid>
				</Paper>
			</Grid>
		</Grid>
	);
}

const autoCompleteMock = [
	{
		Version: 1,
		Key: '182536',
		Type: 'City',
		Rank: 10,
		LocalizedName: 'Athens',
		Country: { ID: 'GR', LocalizedName: 'Greece' },
		AdministrativeArea: { ID: 'I', LocalizedName: 'Attica' },
	},
	{
		Version: 1,
		Key: '316938',
		Type: 'City',
		Rank: 10,
		LocalizedName: 'Ankara',
		Country: { ID: 'TR', LocalizedName: 'Turkey' },
		AdministrativeArea: { ID: '06', LocalizedName: 'Ankara' },
	},
	{
		Version: 1,
		Key: '126995',
		Type: 'City',
		Rank: 11,
		LocalizedName: 'Alexandria',
		Country: { ID: 'EG', LocalizedName: 'Egypt' },
		AdministrativeArea: { ID: 'ALX', LocalizedName: 'Alexandria' },
	},
	{
		Version: 1,
		Key: '56912',
		Type: 'City',
		Rank: 13,
		LocalizedName: 'Anqing',
		Country: { ID: 'CN', LocalizedName: 'China' },
		AdministrativeArea: { ID: 'AH', LocalizedName: 'Anhui' },
	},
	{
		Version: 1,
		Key: '59083',
		Type: 'City',
		Rank: 15,
		LocalizedName: 'Anyang',
		Country: { ID: 'CN', LocalizedName: 'China' },
		AdministrativeArea: { ID: 'HA', LocalizedName: 'Henan' },
	},
	{
		Version: 1,
		Key: '102138',
		Type: 'City',
		Rank: 15,
		LocalizedName: 'Anshan',
		Country: { ID: 'CN', LocalizedName: 'China' },
		AdministrativeArea: { ID: 'LN', LocalizedName: 'Liaoning' },
	},
	{
		Version: 1,
		Key: '202438',
		Type: 'City',
		Rank: 15,
		LocalizedName: 'Ahmedabad',
		Country: { ID: 'IN', LocalizedName: 'India' },
		AdministrativeArea: { ID: 'GJ', LocalizedName: 'Gujarat' },
	},
	{
		Version: 1,
		Key: '2093',
		Type: 'City',
		Rank: 20,
		LocalizedName: 'Algiers',
		Country: { ID: 'DZ', LocalizedName: 'Algeria' },
		AdministrativeArea: { ID: '16', LocalizedName: 'Alger' },
	},
	{
		Version: 1,
		Key: '126831',
		Type: 'City',
		Rank: 20,
		LocalizedName: 'Addis Ababa',
		Country: { ID: 'ET', LocalizedName: 'Ethiopia' },
		AdministrativeArea: { ID: 'AA', LocalizedName: 'Addis Ababa' },
	},
	{
		Version: 1,
		Key: '178551',
		Type: 'City',
		Rank: 20,
		LocalizedName: 'Accra',
		Country: { ID: 'GH', LocalizedName: 'Ghana' },
		AdministrativeArea: { ID: 'AA', LocalizedName: 'Greater Accra' },
	},
];

const currentWeatherMock = {
	LocalObservationDateTime: '2020-03-14T10:05:00+02:00',
	EpochTime: 1584173100,
	WeatherText: 'Clouds and sun',
	WeatherIcon: 4,
	HasPrecipitation: false,
	PrecipitationType: null,
	IsDayTime: true,
	Temperature: {
		Metric: {
			Value: 18.3,
			Unit: 'C',
			UnitType: 17,
		},
		Imperial: {
			Value: 65,
			Unit: 'F',
			UnitType: 18,
		},
	},
	MobileLink:
		'http://m.accuweather.com/en/il/netanya/212474/current-weather/212474?lang=en-us',
	Link:
		'http://www.accuweather.com/en/il/netanya/212474/current-weather/212474?lang=en-us',
};

const telavivLocationInfoMock = [
	{
		Version: 1,
		Key: '215854',
		Type: 'City',
		Rank: 31,
		LocalizedName: 'Tel Aviv',
		Country: {
			ID: 'IL',
			LocalizedName: 'Israel',
		},
		AdministrativeArea: {
			ID: 'TA',
			LocalizedName: 'Tel Aviv',
		},
	},
];

const telavivCurrentWeatherMock = [
	{
		LocalObservationDateTime: '2020-03-14T11:30:00+02:00',
		EpochTime: 1584178200,
		WeatherText: 'Partly sunny',
		WeatherIcon: 3,
		HasPrecipitation: false,
		PrecipitationType: null,
		IsDayTime: true,
		Temperature: {
			Metric: {
				Value: 19.2,
				Unit: 'C',
				UnitType: 17,
			},
			Imperial: {
				Value: 66,
				Unit: 'F',
				UnitType: 18,
			},
		},
		MobileLink:
			'http://m.accuweather.com/en/il/tel-aviv/215854/current-weather/215854?lang=en-us',
		Link:
			'http://www.accuweather.com/en/il/tel-aviv/215854/current-weather/215854?lang=en-us',
	},
];

const fiveDayForecastMock = {
	Headline: {
		EffectiveDate: '2020-03-17T07:00:00+02:00',
		EffectiveEpochDate: 1584421200,
		Severity: 2,
		Text:
			'Air quality will be unhealthy for sensitive groups Saturday morning through Monday afternoon',
		Category: 'rain',
		EndDate: '2020-03-18T07:00:00+02:00',
		EndEpochDate: 1584507600,
		MobileLink:
			'http://m.accuweather.com/en/il/netanya/212474/extended-weather-forecast/212474?unit=c&lang=en-us',
		Link:
			'http://www.accuweather.com/en/il/netanya/212474/daily-weather-forecast/212474?unit=c&lang=en-us',
	},
	DailyForecasts: [
		{
			Date: '2020-03-14T07:00:00+02:00',
			EpochDate: 1584162000,
			Temperature: {
				Minimum: {
					Value: 14.2,
					Unit: 'C',
					UnitType: 17,
				},
				Maximum: {
					Value: 19,
					Unit: 'C',
					UnitType: 17,
				},
			},
			Day: {
				Icon: 14,
				IconPhrase: 'Partly sunny w/ showers',
				HasPrecipitation: true,
				PrecipitationType: 'Rain',
				PrecipitationIntensity: 'Light',
			},
			Night: {
				Icon: 37,
				IconPhrase: 'Hazy moonlight',
				HasPrecipitation: false,
			},
			Sources: ['AccuWeather'],
			MobileLink:
				'http://m.accuweather.com/en/il/netanya/212474/daily-weather-forecast/212474?day=1&unit=c&lang=en-us',
			Link:
				'http://www.accuweather.com/en/il/netanya/212474/daily-weather-forecast/212474?day=1&unit=c&lang=en-us',
		},
		{
			Date: '2020-03-15T07:00:00+02:00',
			EpochDate: 1584248400,
			Temperature: {
				Minimum: {
					Value: 12.8,
					Unit: 'C',
					UnitType: 17,
				},
				Maximum: {
					Value: 20.4,
					Unit: 'C',
					UnitType: 17,
				},
			},
			Day: {
				Icon: 6,
				IconPhrase: 'Mostly cloudy',
				HasPrecipitation: false,
			},
			Night: {
				Icon: 37,
				IconPhrase: 'Hazy moonlight',
				HasPrecipitation: false,
			},
			Sources: ['AccuWeather'],
			MobileLink:
				'http://m.accuweather.com/en/il/netanya/212474/daily-weather-forecast/212474?day=2&unit=c&lang=en-us',
			Link:
				'http://www.accuweather.com/en/il/netanya/212474/daily-weather-forecast/212474?day=2&unit=c&lang=en-us',
		},
		{
			Date: '2020-03-16T07:00:00+02:00',
			EpochDate: 1584334800,
			Temperature: {
				Minimum: {
					Value: 13,
					Unit: 'C',
					UnitType: 17,
				},
				Maximum: {
					Value: 21.7,
					Unit: 'C',
					UnitType: 17,
				},
			},
			Day: {
				Icon: 5,
				IconPhrase: 'Hazy sunshine',
				HasPrecipitation: false,
			},
			Night: {
				Icon: 35,
				IconPhrase: 'Partly cloudy',
				HasPrecipitation: false,
			},
			Sources: ['AccuWeather'],
			MobileLink:
				'http://m.accuweather.com/en/il/netanya/212474/daily-weather-forecast/212474?day=3&unit=c&lang=en-us',
			Link:
				'http://www.accuweather.com/en/il/netanya/212474/daily-weather-forecast/212474?day=3&unit=c&lang=en-us',
		},
		{
			Date: '2020-03-17T07:00:00+02:00',
			EpochDate: 1584421200,
			Temperature: {
				Minimum: {
					Value: 11.7,
					Unit: 'C',
					UnitType: 17,
				},
				Maximum: {
					Value: 19.4,
					Unit: 'C',
					UnitType: 17,
				},
			},
			Day: {
				Icon: 14,
				IconPhrase: 'Partly sunny w/ showers',
				HasPrecipitation: true,
				PrecipitationType: 'Rain',
				PrecipitationIntensity: 'Light',
			},
			Night: {
				Icon: 39,
				IconPhrase: 'Partly cloudy w/ showers',
				HasPrecipitation: true,
				PrecipitationType: 'Rain',
				PrecipitationIntensity: 'Light',
			},
			Sources: ['AccuWeather'],
			MobileLink:
				'http://m.accuweather.com/en/il/netanya/212474/daily-weather-forecast/212474?day=4&unit=c&lang=en-us',
			Link:
				'http://www.accuweather.com/en/il/netanya/212474/daily-weather-forecast/212474?day=4&unit=c&lang=en-us',
		},
		{
			Date: '2020-03-18T07:00:00+02:00',
			EpochDate: 1584507600,
			Temperature: {
				Minimum: {
					Value: 11.6,
					Unit: 'C',
					UnitType: 17,
				},
				Maximum: {
					Value: 15.5,
					Unit: 'C',
					UnitType: 17,
				},
			},
			Day: {
				Icon: 3,
				IconPhrase: 'Partly sunny',
				HasPrecipitation: false,
			},
			Night: {
				Icon: 35,
				IconPhrase: 'Partly cloudy',
				HasPrecipitation: true,
				PrecipitationType: 'Rain',
				PrecipitationIntensity: 'Light',
			},
			Sources: ['AccuWeather'],
			MobileLink:
				'http://m.accuweather.com/en/il/netanya/212474/daily-weather-forecast/212474?day=5&unit=c&lang=en-us',
			Link:
				'http://www.accuweather.com/en/il/netanya/212474/daily-weather-forecast/212474?day=5&unit=c&lang=en-us',
		},
	],
};
