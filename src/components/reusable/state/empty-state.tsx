type TProps<T = any> = {
  data?: T[];
  message?: string;
  children: React.ReactNode;
  emptyFallback: React.ReactElement;
};

const EmptyState = <T,>({
  data,
  message,
  children,
  emptyFallback,
}: TProps<T>) => {
  return (
    <>{data !== undefined && data.length > 0 ? children : emptyFallback}</>
  );
};

export default EmptyState;
