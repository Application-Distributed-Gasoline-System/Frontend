import { PropsWithChildren, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const PageTitle = ({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) => (
  <h1
    className={cn("text-3xl font-bold tracking-tight", className)}
    {...props}
  >
    {children}
  </h1>
);

export const PageDescription = ({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>) => (
  <p className={cn("text-muted-foreground", className)} {...props}>
    {children}
  </p>
);

export const SectionTitle = ({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) => (
  <h2
    className={cn("text-xl font-semibold tracking-tight", className)}
    {...props}
  >
    {children}
  </h2>
);

export const CardTitle = ({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>) => (
  <h3 className={cn("text-lg font-semibold", className)} {...props}>
    {children}
  </h3>
);
