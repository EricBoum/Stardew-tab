export interface LINK_ITEM_TYPE {
  id?: string | number;
  name: string;
  url: string;
  logo: string;
  desc?: string;
  type: 'img' | 'text';
  bgColor?: string;
  textColor?: string;
}

export interface TAB_ITEM {
  name: string;
  id: string | number;
}
