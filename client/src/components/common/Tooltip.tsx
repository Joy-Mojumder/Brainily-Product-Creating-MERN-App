const Tooltip = ({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) => {
  return (
    <div className="lg:tooltip lg:tooltip-bottom" data-tip={name}>
      {children}
    </div>
  );
};

export default Tooltip;
