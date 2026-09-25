import { createSignal, Show, For, Switch, Match } from "solid-js";
import { searchPlaces, estimateClimate, placeLabel, canGeolocate, geolocationBlockedReason, currentPlace, geolocationError } from "../lib/climate";
import { formatMonthDay } from "../lib/garden";
import { X, MapPin, Crosshair } from "../lib/icons";
import FrostDateInput from "./FrostDateInput";
import ImportButton from "./ImportButton";

const mmddToDate = (v) => (v ? new Date(2001, Number(v.slice(0, 2)) - 1, Number(v.slice(3))) : null);

// First-run setup (and Settings → "Look up by location"): find the garden's
// location, estimate frost dates + hardiness zone, confirm or adjust, save.
// Manual entry and (on first run) skipping are always available.
export default function SetupModal(props) {
  const [step, setStep] = createSignal("search"); // search | result | manual
  const [query, setQuery] = createSignal("");
  const [places, setPlaces] = createSignal(null);  // null = not searched yet
  const [busy, setBusy] = createSignal("");        // loading message
  const [error, setError] = createSignal("");
  const [notice, setNotice] = createSignal("");    // e.g. frost-free result
  const [draft, setDraft] = createSignal({
    last_frost: props.settings?.last_frost || "",
    first_frost: props.settings?.first_frost || "",
    zone: props.settings?.zone || "",
    location: props.settings?.location || "",
  });
  const patch = (p) => setDraft((d) => ({ ...d, ...p }));

  async function search(e) {
    e.preventDefault();
    if (!query().trim()) return;
    setError(""); setBusy("Searching…");
    try {
      setPlaces(await searchPlaces(query().trim()));
    } catch {
      setError("Couldn't reach the place search. Check your connection, or enter dates manually.");
    } finally { setBusy(""); }
  }

  // Preferred path: the browser's own location.
  async function locate() {
    setError(""); setBusy("Finding your location…");
    let place;
    try {
      place = await currentPlace();
    } catch (err) {
      setBusy("");
      return setError(geolocationError(err));
    }
    pick(place);
  }

  async function pick(place) {
    setError(""); setBusy(`Reading 30 years of weather for ${place.name}…`);
    try {
      const c = await estimateClimate(place);
      patch({ zone: c.zone || "", location: placeLabel(place) });
      if (c.frostFree) {
        setNotice(`${place.name} rarely gets frost, so there are no typical frost dates to estimate. Enter reference dates below if you'd like timing on the almanac.`);
        patch({ last_frost: "", first_frost: "" });
        setStep("manual");
      } else {
        patch({ last_frost: c.last_frost, first_frost: c.first_frost });
        setStep("result");
      }
    } catch {
      setError("Couldn't load weather history for that place. Try again, or enter dates manually.");
    } finally { setBusy(""); }
  }

  const ready = () => draft().last_frost && draft().first_frost;
  const save = () => props.onSave({ ...draft(), onboarded: "1" });
  const skip = () => props.onSave({ onboarded: "1" });

  const DateFields = () => (
    <div class="setup-dates">
      <div class="setup-date">
        <span class="setup-date__title">Last spring frost</span>
        <FrostDateInput label="Last spring frost" value={draft().last_frost} onChange={(v) => patch({ last_frost: v })} />
      </div>
      <div class="setup-date">
        <span class="setup-date__title">First fall frost</span>
        <FrostDateInput label="First fall frost" value={draft().first_frost} onChange={(v) => patch({ first_frost: v })} />
      </div>
    </div>
  );

  return (
    <div class="scrim">
      <div class="modal modal--setup" role="dialog" aria-modal="true" aria-labelledby="setup-title">
        <header class="modal__head">
          <div>
            <p class="modal__eyebrow">{props.firstRun ? "Welcome" : "Frost dates"}</p>
            <h2 id="setup-title">{props.firstRun ? "Set up your garden" : "Look up by location"}</h2>
          </div>
          <Show when={!props.firstRun}>
            <button class="btn btn--icon" aria-label="Close" onClick={props.onClose}><X size={18} /></button>
          </Show>
        </header>

        <div class="modal__body setup">
          <Switch>
            <Match when={step() === "search"}>
              <p class="setup__intro">
                Every sowing and harvest date is timed from your average frost dates. Share your
                location or search for your town, and Seed Ledger will estimate them from 30 years
                of local weather.
              </p>
              <button class="btn btn--primary setup-locate" onClick={locate}
                disabled={!!busy() || !canGeolocate()} aria-describedby="locate-note">
                <Crosshair size={16} /> Use my current location
              </button>
              <Show when={geolocationBlockedReason()}>
                <p class="setup__note" id="locate-note">
                  {geolocationBlockedReason()}{" "}
                  <a href="https://github.com/treyhardin/seed-ledger#first-run-setup" target="_blank" rel="noopener">Learn more</a>
                </p>
              </Show>
              <p class="setup-or"><span>or search for your town</span></p>
              <form class="setup-search" onSubmit={search}>
                <input class="field__input" type="search" placeholder="Town or city, e.g. Portland"
                  aria-label="Town or city" value={query()} onInput={(e) => setQuery(e.currentTarget.value)} />
                <button type="submit" class="btn" disabled={!!busy()}>Search</button>
              </form>
              <Show when={busy()}><p class="setup__status">{busy()}</p></Show>
              <Show when={!busy() && places()}>
                <Show when={places().length} fallback={<p class="setup__status">No places found. Try a nearby larger town.</p>}>
                  <ul class="place-list">
                    <For each={places()}>
                      {(p) => (
                        <li>
                          <button class="place-opt" onClick={() => pick(p)}>
                            <MapPin size={16} />
                            <span class="place-opt__name">{p.name}</span>
                            <span class="place-opt__region">{p.region}</span>
                          </button>
                        </li>
                      )}
                    </For>
                  </ul>
                </Show>
              </Show>
            </Match>

            <Match when={step() === "result"}>
              <div class="setup-result">
                <p class="setup-result__place"><MapPin size={16} /> {draft().location}</p>
                <dl class="setup-result__grid">
                  <div><dt>Hardiness zone</dt><dd>{draft().zone || "—"}</dd></div>
                  <div><dt>Last spring frost</dt><dd>{formatMonthDay(mmddToDate(draft().last_frost))}</dd></div>
                  <div><dt>First fall frost</dt><dd>{formatMonthDay(mmddToDate(draft().first_frost))}</dd></div>
                </dl>
              </div>
              <p class="setup__note">
                Estimated from 30 years of weather data. Hills, valleys, and cities can shift your
                real dates by a week or more, so adjust them if you know better.
              </p>
              {DateFields()}
            </Match>

            <Match when={step() === "manual"}>
              <Show when={notice()}><p class="setup__notice">{notice()}</p></Show>
              <p class="setup__intro">
                Enter your average last spring and first fall frost dates. A local extension office
                or gardening almanac will have them.
              </p>
              {DateFields()}
              <label class="field setup-zone">
                <span class="field__label">Hardiness zone <em>optional</em></span>
                <input class="field__input" placeholder="e.g. 7b" value={draft().zone}
                  onInput={(e) => patch({ zone: e.currentTarget.value.trim() })} />
              </label>
            </Match>
          </Switch>

          <Show when={error()}><p class="setup__error" role="alert">{error()}</p></Show>
          <Show when={step() !== "manual"}>
            <p class="setup-credit">
              Weather and place search by <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a>
              <Show when={canGeolocate()}>
                {" · "}place names by <a href="https://www.bigdatacloud.com/" target="_blank" rel="noopener">BigDataCloud</a>
              </Show>
            </p>
          </Show>
        </div>

        <footer class="modal__foot modal__foot--split">
          <div class="setup-foot-left">
            <Show when={step() === "search"} fallback={
              <button class="btn btn--ghost" onClick={() => { setStep("search"); setNotice(""); }}>Back</button>
            }>
              <button class="btn btn--ghost" onClick={() => setStep("manual")}>Enter dates manually</button>
              {/* Moving from another install? Bring the whole garden over. */}
              <Show when={props.firstRun}>
                <ImportButton class="btn btn--ghost" hasData={props.seedCount > 0} seedCount={props.seedCount}
                  onImport={props.onImport} onError={props.onError}>
                  Import a backup
                </ImportButton>
              </Show>
            </Show>
          </div>
          <div class="modal__foot-right">
            <Show when={props.firstRun}>
              <button class="btn btn--ghost" onClick={skip}>Skip for now</button>
            </Show>
            <Show when={step() !== "search"}>
              <button class="btn btn--primary" disabled={!ready()} onClick={save}>Save</button>
            </Show>
          </div>
        </footer>
      </div>
    </div>
  );
}
