import { createSignal, Show } from "solid-js";
import SeedFields from "./SeedFields";
import {
  status, START_METHOD, rangeLabel, formatDate,
} from "../lib/garden";
import { X, Shovel, Basket, Trash } from "../lib/icons";
import SunTag from "./SunTag";
import SowWindows from "./SowWindows";
import { dialogIn } from "../lib/motion";
import Progress from "./Progress";
import HarvestButton from "./HarvestButton";

const STATUS_LABEL = { library: "In library", growing: "Growing" };

function Detail(props) {
  const seed = () => props.seed;
  const st = () => status(seed());

  const Cell = (label, value) => (
    <div class="detail__cell"><span class="detail__label">{label}</span><span class="detail__val">{value ?? "—"}</span></div>
  );

  return (
    <div class="detail">
      <div class="detail__top">
        <span class={`pill pill--${st()}`}>{STATUS_LABEL[st()]}</span>
        <Show when={seed().start_method}>
          <span class="method-tag">{START_METHOD[seed().start_method]}</span>
        </Show>
        <span class="card__sun"><SunTag sun={seed().sun} size={15} label /></span>
      </div>

      <Show when={st() === "growing"}>
        <Progress seed={seed()} />
      </Show>
      <Show when={st() === "library" && seed().harvested_date}>
        <p class="card__harvested"><Basket size={15} /> Last harvested {formatDate(seed().harvested_date)}</p>
      </Show>

      <div class="detail__grid">
        {Cell("Planting depth", seed().depth_in != null ? `${seed().depth_in}"` : null)}
        {Cell("Spacing", seed().spacing_in != null ? `${seed().spacing_in}"` : null)}
        {Cell("Seeds per hole", seed().seeds_per_hole)}
        {Cell("Days to maturity", seed().days_to_maturity ? `${seed().days_to_maturity} days` : null)}
        {Cell("Days to germinate", rangeLabel(seed().days_to_germ, seed().days_to_germ_max, " days"))}
        {Cell("Soil temperature", rangeLabel(seed().soil_temp_min, seed().soil_temp_max, "°F"))}
      </div>

      <SowWindows seed={seed()} settings={props.settings} />

      <Show when={seed().start_method === "indoors" && seed().transplant_notes}>
        <div class="detail__notes">
          <span class="detail__label">Transplant</span>
          <p>{seed().transplant_notes}</p>
        </div>
      </Show>

      <Show when={seed().notes}>
        <div class="detail__notes">
          <span class="detail__label">Notes</span>
          <p>{seed().notes}</p>
        </div>
      </Show>
    </div>
  );
}

export default function SeedModal(props) {
  const isNew = () => props.creating;
  const [mode, setMode] = createSignal(isNew() ? "edit" : props.initialMode || "view");
  const seed = () => props.seed;
  const st = () => (seed() ? status(seed()) : "library");

  // Close only on a genuine backdrop click: the press must start on the scrim
  // too, so a text selection dragged out of a field doesn't dismiss the modal.
  let pressedScrim = false;
  const onScrimDown = (e) => { pressedScrim = e.target === e.currentTarget; };
  const onScrimClick = (e) => {
    if (pressedScrim && e.target === e.currentTarget) props.onClose();
    pressedScrim = false;
  };

  async function handleSubmit(data) {
    await props.onSave(data);
    if (isNew()) props.onClose();
    else setMode("view");
  }

  // Close first (animated), then delete, so the dialog doesn't blank out.
  async function handleDelete() {
    const s = seed();
    await props.onClose();
    props.onDelete(s);
  }

  const title = () => (isNew() ? "Add seed" : mode() === "edit" ? `Edit ${seed().name}` : seed().name);

  return (
    <div class="scrim" ref={dialogIn} onPointerDown={onScrimDown} onClick={onScrimClick}>
      <div class="modal" role="dialog" aria-modal="true">
        <Show when={isNew() || seed()}>
        <header class="modal__head">
          <div>
            <h2>{title()}</h2>
            <Show when={mode() === "view" && seed().variety}>
              <p class="modal__variety">{seed().variety}</p>
            </Show>
            <Show when={mode() === "view" && seed().source}>
              <p class="modal__sub">{seed().source}</p>
            </Show>
          </div>
          <button class="btn btn--icon tip" data-tip="Close" aria-label="Close" onClick={props.onClose}><X size={18} /></button>
        </header>

        <Show
          when={mode() === "view"}
          fallback={
            <SeedFields
              seed={seed()}
              submitLabel={isNew() ? "Add seed" : "Save changes"}
              onSubmit={handleSubmit}
              onCancel={isNew() ? props.onClose : () => setMode("view")}
            />
          }
        >
          <div class="modal__body">
            <Detail seed={seed()} settings={props.settings} />
          </div>
          <footer class="modal__foot modal__foot--split">
            <button class="btn btn--icon tip" data-tip="Delete seed" aria-label="Delete seed" onClick={handleDelete}><Trash size={16} /></button>
            <div class="modal__foot-right">
              <Show when={st() === "library"}>
                <button class="btn btn--primary" onClick={() => props.onMarkPlanted(seed())}>
                  <Shovel size={16} /> Mark planted
                </button>
              </Show>
              <Show when={st() === "growing"}>
                <HarvestButton min={seed().planted_date} onConfirm={(d) => props.onMarkHarvested(seed(), d)} />
              </Show>
              <button class="btn" onClick={() => setMode("edit")}>Edit</button>
            </div>
          </footer>
        </Show>
        </Show>
      </div>
    </div>
  );
}
