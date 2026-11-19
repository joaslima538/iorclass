export const go = (route: string) => {
  window.location.hash = route;
  window.scrollTo(0, 0);
};
export function Brand() {
  return (
    <a className="public-brand" href="#inicio">
      <span className="brand-owl">
        ◉◉<i>▾</i>
      </span>
      <span>
        ior<b>CLASS</b>
        <small>GESTÃO PARA PROFESSORES</small>
      </span>
    </a>
  );
}
