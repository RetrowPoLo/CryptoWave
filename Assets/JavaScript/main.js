$(document).ready(async function () {
	// Select the html element with the id 'refresh-btn' and add an on click function that
	// Refresh the page
	$('.refresh-btn').on('click', function () {
		location.reload();
	});

	// ===========================================================================================================================================
	// Button back to top
	// Hide the html element with the class 'btn-top'
	$('.btn-top').hide();
	// If the scroll is under 350px the html element 'btn-top' is hide and after fade in the html page
	$(window).on('scroll', function () {
		if ($(this).scrollTop() < 350) {
			$('.btn-top').fadeOut();
		} else {
			$('.btn-top').fadeIn();
		}
	});
	// Select the html element with the class 'btn-top' and add an on click function that
	// Take back the user to the top of the windows smoothly
	$('.btn-top').on('click', function () {
		$('body, html').animate({ scrollTop: 0 }, 1250);
	});

	// ===========================================================================================================================================
	// ======== GLOBAL VARIABLES ========
	// Number of crypto to get from coincap api and add it to the html
	let cryptoNumber = 10;
	$('.crypto-number-header').html(cryptoNumber);

	// Create array that get value from the api :
	// 		Rank of the crypto, Name of the crypto, Symbol of the crypto, Price of the crypto, Change percent (24hr) of the crypto,
	// 		MarketCap of the crypto, Volume traded (24hr) of the crypto
	let rankData = [];
	let nameData = [];
	let symbolData = [];

	let cryptoPrice;
	let priceData = [];

	let changePercent;
	let changePercentData = [];

	let marketCap;
	let marketCapData = [];

	let volumeTradeDay;
	let volumeTradeDayData = [];

	let cryptoIcon;

	// ===========================================================================================================================================
	// Function that create card
	let card;
	let cardClass = '';
	function Card() {
		$('.card-wrapper').html(card);
	}

	// For every crypto create a card with a special class corresponding to their rank.
	// The card already contains :
	// 		- an empty img tag to receive the icon of the crypto
	// 		- a div where the rank and the name of the crypto will be
	for (let i = 0; i < cryptoNumber; i++) {
		cardClass = `crypto-${i}`;
		if (i == 0) {
			card = `<div class="card ${cardClass}"> <img class="crypto-img crypto-logo-${i}" src="" alt="" /> <div class="crypto-rn crypto-rank-name-${i}"></div> </div>`;
			// card = `<div class="card ${cardClass}"> <div class="welle"></div> <img class="crypto-img crypto-logo-${i}" src="" alt="" /> <div class="crypto-rn crypto-rank-name-${i}"></div> </div>`;
		} else {
			card =
				card +
				`<div class="card ${cardClass}"> <img class="crypto-img crypto-logo-${i}" src="" alt="" /> <div class="crypto-rn crypto-rank-name-${i}"></div> </div>`;
			// `<div class="card ${cardClass}"> <div class="welle"></div> <img class="crypto-img crypto-logo-${i}" src="" alt="" /> <div class="crypto-rn crypto-rank-name-${i}"></div> </div>`;
		}
	}

	// ===========================================================================================================================================
	// Async function that get a number of crypto and their data such as their name, rank, current price ... from coincap api
	async function TopRequest() {
		// Get crypto by coincap api
		let getTop = `https://api.coincap.io/v2/assets?limit=${cryptoNumber}`;

		// Fetch the api and convert the response into json
		fetch(getTop)
			.then((reponse) => reponse.json())
			.then((reponse) => {
				reponse.data.forEach((element) => {
					// Get rank data and add it to html
					rankData.push(element.rank);
					$(`.crypto-rank-name-${element.rank - 1}`).html(
						`<h2 class="crypto-rank">#${rankData[element.rank - 1]}</h2>`
					);

					// Get name data and add it to html
					nameData.push(element.name);
					$(`.crypto-rank-name-${element.rank - 1}`).append(
						`<h2 class="crypto-name">${nameData[element.rank - 1]}</h2>`
					);

					// Get symbol data and call another function to get the crypto icon from another api
					// After getting the api response it check the status of that response:
					// 		- display the crypto logo
					// 		- display a generic icon if the logo isn't in the api
					symbolData.push(element.symbol.toLowerCase());
					cryptoIcon = symbolData[element.rank - 1];
					TopIconRequest(element.rank, element.name);
					$(`.crypto-${element.rank - 1}`).append(`<h2 class="crypto-symbol">${symbolData[element.rank - 1]}</h2>`);

					// Get the price in usd then call a function to round it to 2 decimals and add it to html
					cryptoPrice = Round2Decimals(element.priceUsd);
					priceData.push(cryptoPrice);
					$(`.crypto-${element.rank - 1}`).append(`<h2 class="crypto-price">${priceData[element.rank - 1]} $ </h2>`);

					// Get the change percent on a day, call a function to round it to 2 decimals
					// Then take it to another function that check if he is negative or positive to add him a different class
					// And add it to html
					changePercent = Round2Decimals(element.changePercent24Hr);
					changePercentData.push(changePercent);
					CheckUpDownPercent(element.rank, changePercent);

					// Get the marketcap in usd then call a function to round it to 2 decimals and add it to html
					marketCap = Round2Decimals(element.marketCapUsd);
					marketCapData.push(marketCap);
					$(`.crypto-${element.rank - 1}`).append(
						`<h2 class="crypto-marketcap"> <span class="marketcap">Market Cap</span> ${
							marketCapData[element.rank - 1]
						} $ </h2>`
					);

					// Get the volume traded then call a function to it to 2 decimals and add it to html
					volumeTradeDay = Round2Decimals(element.volumeUsd24Hr);
					volumeTradeDayData.push(volumeTradeDay);
					$(`.crypto-${element.rank - 1}`).append(
						`<h2 class="crypto-volume-trade"> <span class="volume-trade">Volume Traded</span> ${
							volumeTradeDayData[element.rank - 1]
						} $ </h2>`
					);

					// Add a button at the end of the crypto card to see chart from the selected crypto
					$(`.crypto-${element.rank - 1}`).append(
						`<button class="crypto-btn crypto-button-${
							element.rank - 1
						}"> See more <i class="fa-solid fa-chevron-right"></i> </button>`
					);
				});
			});
	}

	// ===========================================================================================================================================
	// Async function that get from an api the crypto selected icon
	// It takes an index to add the img and the symbol of the crypto to get
	async function TopIconRequest(index, name) {
		let fetchResult = await fetch(`https://cryptoflash-icons-api.herokuapp.com/128/icon/${cryptoIcon}`);

		// Check if the status of the fetch result is 404 ( => doesn't exist or not yet added to the api)
		// If so, it generate a generic icon from the api and add it to html
		if (fetchResult.status == 404) {
			$(`.crypto-logo-${index - 1}`).attr({
				src: 'https://cryptoflash-icons-api.herokuapp.com/128/generic',
				alt: 'Generic crypto icon',
			});
			return;
		}

		// Add the crypto icon to the img tag in the card with an alternative text for accessibility
		$(`.crypto-logo-${index - 1}`).attr({
			src: `${fetchResult.url}`,
			alt: `${name} crypto icon`,
		});
	}

	// ===========================================================================================================================================
	// Function that check if a given number is negative or not
	// and add it to html with a different class
	function CheckUpDownPercent(index, percent) {
		// Negative percent => red color with an arrow pointing down
		if (percent < 0) {
			$(`.crypto-${index - 1}`).append(
				`<h2 class="crypto-change-percent crypto-change-percent-down"> <span class="day-percent">Day %</span>  ${
					changePercentData[index - 1]
				} <i class="fa-solid fa-arrow-trend-down"></i> </h2>`
			);
			return;
		}
		// Positive percent => green color with an arrow pointing up
		$(`.crypto-${index - 1}`).append(
			`<h2 class="crypto-change-percent crypto-change-percent-up"> <span class="day-percent">Day %</span> +${
				changePercentData[index - 1]
			} <i class="fa-solid fa-arrow-trend-up"></i> </h2>`
		);
	}

	// ===========================================================================================================================================
	// Function that round a given number up to 2 decimals
	// Even if the number don't have decimals (42 => 42.00, 3.6666 => 3.66)
	function Round2Decimals(value) {
		value = +value;

		// Shift
		value = value.toString().split('e');
		value = Math.round(+(value[0] + 'e' + (value[1] ? +value[1] + 2 : 2)));

		// Shift back
		value = value.toString().split('e');
		return (+(value[0] + 'e' + (value[1] ? +value[1] - 2 : -2))).toFixed(2);
	}

	Card();
	await TopRequest();
});
