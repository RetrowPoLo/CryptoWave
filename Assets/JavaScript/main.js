// Display a preloader until the document is ready
$(window).on('load', function () {
	$('.loader-container').fadeOut(1500);
});

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
	const cryptoNumber = 20;
	$('.crypto-number-header').html(cryptoNumber);

	// Create array that get value from the api :
	// 		Rank of the crypto, Name of the crypto, Symbol of the crypto, Price of the crypto, Change percent (24hr) of the crypto,
	// 		MarketCap of the crypto, Volume traded (24hr) of the crypto and the id of the crypto
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

	let idData = [];

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
			card = `<div class="card ${cardClass}"> <div class="crypto-rn crypto-rank-name-${i}"></div> </div>`;
		} else {
			card = card + `<div class="card ${cardClass}"> <div class="crypto-rn crypto-rank-name-${i}"></div> </div>`;
		}
	}

	// ===========================================================================================================================================
	// Async function that get a number of crypto and their data such as their name, rank, current price ... from coincap api
	async function TopRequest() {
		// Get crypto by coincap api
		let getTop = `https://api.coincap.io/v2/assets?limit=${cryptoNumber}`;

		// Fetch the api and convert the response into json
		fetch(getTop)
			.then((reponse) => {
				if (!reponse.ok) {
					throw new Error(reponse.statusText);
				}
				return reponse.json();
			})
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

					// Get the id of the crypto to update their price in another function
					idData.push(element.id);

					// Add a button at the end of the crypto card to see chart from the selected crypto
					$(`.crypto-${element.rank - 1}`).append(
						`<button class="crypto-btn crypto-button-${
							element.rank - 1
						}" aria-label="See more"> See more <i class="fa-solid fa-chevron-right"></i> </button>`
					);
				});
			})
			.catch((error) => {
				// Log the error to the console
				console.error(error);
				// Add the coin back to the end of the array
				coins.push(coin);
			});
	}

	// ===========================================================================================================================================
	// Function that upadate the price of the crypto every 10s one at the time
	function CryptoPriceUpdate() {
		// Get the next coin in the array of crypto data
		let coin = idData.shift();
		// Url to fetch
		let updateTop = `https://api.coincap.io/v2/assets/${coin}`;

		let cardPrice;
		let oldPrice;
		let newPrice;

		// Fetch the url to update the price
		fetch(updateTop)
			.then((response) => {
				if (!response.ok) {
					throw new Error(response.statusText);
				}
				return response.json();
			})
			.then((data) => {
				// Add to a variable the jquery selector for the crypto price on the card
				cardPrice = $(`.crypto-${data.data.rank - 1}`).children('.crypto-price');

				oldPrice = priceData[data.data.rank - 1];
				newPrice = Round2Decimals(data.data.priceUsd);

				// Compare the new crypto price with the old one and if he is inferior:
				// 		- make it red and blink then back to normal
				// 		- same with green if the new price is greater
				if (newPrice < oldPrice) {
					// Add red color
					cardPrice.css({ color: '#F80000', 'font-weight': '800' });
					// Blink effect
					cardPrice.fadeTo(1000, 0.25, function () {
						cardPrice.fadeTo(1000, 1.0);
					});
					// Back to normal after 2.3s
					setTimeout(() => {
						cardPrice.css({ color: '', 'font-weight': '500' });
					}, 2300);
				} else {
					// Add green color
					cardPrice.css({ color: '#32CD32', 'font-weight': '800' });
					// Blink effect
					cardPrice.fadeTo(1000, 0.25, function () {
						cardPrice.fadeTo(1000, 1.0);
					});
					// Back to normal after 2.3s
					setTimeout(() => {
						cardPrice.css({ color: '', 'font-weight': '500' });
					}, 2300);
				}

				// Change the price on the card
				cardPrice.html(`${newPrice} $`);

				// Add the coin back to the end of the array
				idData.push(coin);
			})
			.catch((error) => {
				// Log the error to the console
				console.error(error);
				// Add the coin back to the end of the array
				coins.push(coin);
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

	// ===========================================================================================================================================
	// Function call :
	// 		- Generate the crypto car
	// 		- Get the primary information of the crypto and add it to the previously created card
	// 		- Update the crypto price one at the time every 5s
	Card();
	await TopRequest();

	setInterval(CryptoPriceUpdate, 5000);
});
