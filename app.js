(function () {
  const RATE_SOURCES = [
    {
      name: "Open ER API",
      url: "https://open.er-api.com/v6/latest/USD",
      parse(data) {
        return {
          rate: Number(data.rates && data.rates.CNY),
          updated: data.time_last_update_unix
            ? new Date(data.time_last_update_unix * 1000).toISOString()
            : new Date().toISOString()
        };
      }
    },
    {
      name: "Frankfurter",
      url: "https://api.frankfurter.app/latest?from=USD&to=CNY",
      parse(data) {
        return {
          rate: Number(data.rates && data.rates.CNY),
          updated: data.date ? `${data.date}T12:00:00.000Z` : new Date().toISOString()
        };
      }
    }
  ];
  const FALLBACK_RATE = 7.25;
  const STORAGE_KEY = "rmb-dollar-converter";

  const state = {
    mode: "cny-usd",
    amount: 100,
    liveRate: FALLBACK_RATE,
    activeRate: FALLBACK_RATE,
    rateMode: "live",
    rateSource: "Fallback",
    lastUpdated: null
  };

  const el = {
    refreshRate: document.querySelector("#refreshRate"),
    rateLabel: document.querySelector("#rateLabel"),
    rateStatus: document.querySelector("#rateStatus"),
    cnyToUsd: document.querySelector("#cnyToUsd"),
    usdToCny: document.querySelector("#usdToCny"),
    inputLabel: document.querySelector("#inputLabel"),
    inputSymbol: document.querySelector("#inputSymbol"),
    amountInput: document.querySelector("#amountInput"),
    resultLabel: document.querySelector("#resultLabel"),
    resultValue: document.querySelector("#resultValue"),
    copyResult: document.querySelector("#copyResult"),
    customRate: document.querySelector("#customRate"),
    useCustom: document.querySelector("#useCustom"),
    useLive: document.querySelector("#useLive")
  };

  const money = {
    cny: new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    usd: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
  };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved) return;
      Object.assign(state, saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function formatRateDate(value) {
    if (!value) return "offline fallback";
    return new Date(value).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function conversionResult() {
    if (state.mode === "cny-usd") {
      return state.amount / state.activeRate;
    }
    return state.amount * state.activeRate;
  }

  function render() {
    const isCnyToUsd = state.mode === "cny-usd";
    const result = conversionResult();
    const statusText = state.rateMode === "custom" ? "Custom" : state.lastUpdated ? "Live" : "Offline";

    el.cnyToUsd.classList.toggle("active", isCnyToUsd);
    el.usdToCny.classList.toggle("active", !isCnyToUsd);
    el.cnyToUsd.setAttribute("aria-selected", String(isCnyToUsd));
    el.usdToCny.setAttribute("aria-selected", String(!isCnyToUsd));

    el.inputLabel.textContent = isCnyToUsd ? "RMB amount" : "Dollar amount";
    el.inputSymbol.textContent = isCnyToUsd ? "RMB" : "$";
    el.resultLabel.textContent = isCnyToUsd ? "USD" : "RMB";
    el.resultValue.value = isCnyToUsd ? money.usd.format(result) : `RMB ${money.cny.format(result)}`;
    el.resultValue.textContent = el.resultValue.value;

    el.rateLabel.textContent = `1 USD = ${state.activeRate.toFixed(4)} RMB`;
    el.rateStatus.textContent = statusText;
    el.rateStatus.classList.toggle("offline", statusText === "Offline");
    el.refreshRate.title = `${state.rateSource}. Last updated: ${formatRateDate(state.lastUpdated)}`;
    el.customRate.value = state.rateMode === "custom" ? state.activeRate : "";

  }

  function setMode(mode) {
    state.mode = mode;
    saveState();
    render();
  }

  async function fetchLiveRate() {
    el.rateStatus.textContent = "Loading";
    for (const source of RATE_SOURCES) {
      try {
        const response = await fetch(source.url, { cache: "no-store" });
        if (!response.ok) throw new Error("Rate request failed");
        const parsed = source.parse(await response.json());
        if (!parsed.rate || parsed.rate <= 0) throw new Error("CNY rate missing");

        state.liveRate = parsed.rate;
        state.lastUpdated = parsed.updated;
        state.rateSource = source.name;

        if (state.rateMode !== "custom") {
          state.rateMode = "live";
          state.activeRate = parsed.rate;
        }
        saveState();
        render();
        return;
      } catch {
        continue;
      }
    }

    if (state.rateMode !== "custom") {
      state.rateMode = "live";
      state.activeRate = state.liveRate || FALLBACK_RATE;
      state.rateSource = "Saved fallback";
    }
    saveState();
    render();
  }

  el.cnyToUsd.addEventListener("click", () => setMode("cny-usd"));
  el.usdToCny.addEventListener("click", () => setMode("usd-cny"));

  el.amountInput.addEventListener("input", (event) => {
    state.amount = Number(event.target.value) || 0;
    saveState();
    render();
  });

  el.refreshRate.addEventListener("click", fetchLiveRate);

  el.useCustom.addEventListener("click", () => {
    const customRate = Number(el.customRate.value);
    if (!customRate || customRate <= 0) {
      el.customRate.focus();
      return;
    }
    state.rateMode = "custom";
    state.activeRate = customRate;
    saveState();
    render();
  });

  el.useLive.addEventListener("click", () => {
    state.rateMode = "live";
    state.activeRate = state.liveRate || FALLBACK_RATE;
    saveState();
    render();
    fetchLiveRate();
  });

  el.copyResult.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(el.resultValue.value);
      el.copyResult.textContent = "Copied";
      setTimeout(() => {
        el.copyResult.textContent = "Copy";
      }, 1200);
    } catch {
      el.copyResult.textContent = "Select";
    }
  });

  loadState();
  el.amountInput.value = state.amount;
  render();
  fetchLiveRate();
})();
