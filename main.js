// menu & units
document.addEventListener("DOMContentLoaded", () => {
   const menu = document.getElementById("menu");
   const units = document.querySelectorAll(".unit");
   let activeUnit = null;

   function showMenu() {
      menu.style.display = "block";
   }

   function hideMenu() {
      menu.style.display = "none";
   }

   // units
   units.forEach((unit) => {
      unit.addEventListener("click", (e) => {
         e.stopPropagation();

         units.forEach((u) =>
            u.querySelector("img")?.classList.remove("arrow")
         );
         e.currentTarget.querySelector("img").classList.add("arrow");

         activeUnit = unit;

         const unitRect = unit.getBoundingClientRect();
         const viewportWidth = window.innerWidth;

         menu.style.position = "absolute";
         menu.style.top = `${unitRect.top + window.scrollY + 70}px`;
         showMenu();

         let menuLeft = unitRect.left + window.scrollX;
         const menuWidth = menu.offsetWidth;

         if (menuLeft + menuWidth > viewportWidth - 20) {
            menuLeft = viewportWidth - menuWidth - 20;
         }
         if (menuLeft < 20) {
            menuLeft = 20;
         }
         menu.style.left = `${menuLeft}px`;
      });
   });

   menu.addEventListener("click", (a) => {
      const target = a.target.closest("li");
      if (target && activeUnit) {
         a.stopPropagation();
         activeUnit.querySelector("div").innerHTML = target.innerHTML.trim();
         hideMenu();
         activeUnit.querySelector("img").classList.remove("arrow");
      }
   });

   document.addEventListener("click", (e) => {
      if (
         !menu.contains(e.target) &&
         ![...units].some((unit) => unit.contains(e.target))
      ) {
         hideMenu();
         activeUnit = null;
         units.forEach((u) =>
            u.querySelector("img")?.classList.remove("arrow")
         );
      }
   });

   // search
   const input = document.querySelector("ul input");
   input.addEventListener("input", () => {
      const listItems = document.querySelectorAll("ul li");
      const noMatchMessage = document.querySelector("ul > span");
      let hasMatch = false;

      listItems.forEach((e) => {
         const item = e.textContent.trim().toLocaleLowerCase();
         const query = input.value.trim().toLocaleLowerCase();

         if (query === "" || item.includes(query)) {
            e.style.display = "block";
            hasMatch = true;
         } else {
            e.style.display = "none";
         }
      });

      if (!hasMatch) {
         noMatchMessage.style.display = "block";
      } else {
         noMatchMessage.style.display = "none";
      }
   });

   // display id
   const listItems = document.querySelectorAll("ul li");

   listItems.forEach((li) => {
      const id = li.id;
      const idParagraph = document.createElement("p");
      idParagraph.textContent = id;

      const span = li.querySelector("span");
      span.insertAdjacentElement("afterend", idParagraph);
   });

   // Amount validation
   const amount = document.getElementById("istme");
   amount.addEventListener("input", () => {
      const input = amount.value;
      const message = document.getElementById("amoutMessage");
      const nums = input.replace(/\D/g, "");

      message.style.display = nums === "" ? "inline" : "none";
   });

   function amountFilter(e) {
      e.value = e.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\./g, "$1");
      const parts = e.value.split(".");
      parts[0] = Number(parts[0]).toLocaleString("en-US");
      e.value = parts.join(".");
   }

   amount.addEventListener("blur", () => {
      amountFilter(amount);
   });

   // Result
   const button = document.querySelector("#conversion button");
   button.addEventListener("click", () => {
      button.textContent = "Converting...";
      button.style.width = "180px";

      const result = document.getElementById("result");
      const value = document
         .getElementById("istme")
         .value.replace(/[^0-9.]/g, ""); // Remove commas for calculation
      const numericValue = parseFloat(value);
      const from = document.querySelector("#from p").textContent.toUpperCase();
      const to = document.querySelector("#to p").textContent.toUpperCase();
      const fromFull = document.querySelector("#from > div");
      const toFull = document.querySelector("#to > div");

      fetch(
         `https://v6.exchangerate-api.com/v6/a7c65645617795e10dc69b27/latest/${from}`
      )
         .then((res) => res.json())
         .then((data) => {
            button.textContent = "Converted";
            button.style.width = "160px";

            const conversionRates = data.conversion_rates;
            const rateFromTo = conversionRates[to];
            const rateToFrom = 1 / rateFromTo;

            result.innerHTML = `<div>
               <span>${numericValue.toLocaleString("en-US")}</span>
               <span>${fromFull.innerHTML} =</span>
            </div>
            <div>
               <span>${Number((numericValue * rateFromTo).toFixed(6)).toLocaleString("en-US")}</span>
               <span>${toFull.innerHTML}</span>
            </div>
            <div>
               <p class="pa">1 ${from} = ${rateFromTo.toFixed(4)} ${to}</p>
               <p class="pa">1 ${to} = ${rateToFrom.toFixed(4)} ${from}</p>
            </div>`;
         })
         .catch((err) => {
            button.textContent = "Failed";
            button.style.width = "138px";
            console.log(err);
         });
   });
});
// filter & missing
fetch("https://v6.exchangerate-api.com/v6/a7c65645617795e10dc69b27/latest/USD")
   .then((res) => res.json())
   .then((data) => {
      const conversionRates = data.conversion_rates;
      const listItems = document.querySelectorAll("#menu li");
      const apiCurrencies = Object.keys(conversionRates);
      let arr = [];

      listItems.forEach((li) => {
         const currencyCode = li.id;
         if (!conversionRates[currencyCode]) {
            li.style.display = "none";
            arr.push(li);
         }
      });
      if (arr.length > 0) {
         console.log("extra currencies in \n#menu:", arr);
      }
      const menuListItems = Array.from(document.querySelectorAll("#menu li"));
      const menuCurrencyIDs = menuListItems.map((li) => li.id);

      const missingCurrencies = apiCurrencies.filter(
         (currency) => !menuCurrencyIDs.includes(currency)
      );

      if (missingCurrencies.length > 0) {
         console.log("Missing currencies in \n#menu:", missingCurrencies);
      }
   })
   .catch((err) => {
      console.log("Failed to fetch data", err);
   });
