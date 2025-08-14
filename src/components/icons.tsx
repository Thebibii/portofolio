import {
  Edit,
  ExternalLink,
  Filter,
  Github,
  Instagram,
  Mail,
  Menu,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type IconProps = React.HTMLAttributes<SVGElement>;
export const Icons = {
  Menu: (props: IconProps) => <Menu {...props} />,
  Github: (props: IconProps) => <Github {...props} />,
  Mail: (props: IconProps) => <Mail {...props} />,
  Instagram: (props: IconProps) => <Instagram {...props} />,
  Trash2: (props: IconProps) => <Trash2 {...props} />,
  ExternalLink: (props: IconProps) => <ExternalLink {...props} />,
  Edit: (props: IconProps) => <Edit {...props} />,
  Search: (props: IconProps) => <Search {...props} />,
  Plus: (props: IconProps) => <Plus {...props} />,
  Filter: (props: IconProps) => <Filter {...props} />,
  X: (props: IconProps) => <X {...props} />,
};
