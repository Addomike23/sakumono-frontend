const PagePlaceholder = ({ title }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
    <span className="eyebrow mb-3">Coming up next</span>
    <h1 className="text-3xl md:text-4xl font-medium mb-2">{title}</h1>
    <p className="text-ink/60 max-w-md">
      This page is being built in the next pass. The route, layout, and API
      wiring are already in place.
    </p>
  </div>
);

export default PagePlaceholder;
