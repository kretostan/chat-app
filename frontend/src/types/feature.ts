export interface Feature {
  id: string;
  title: string;
  text: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconSize: number;
}
