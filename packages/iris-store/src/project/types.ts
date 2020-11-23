export interface IProject {
  id: string;
  name: string;
  images?: number;
  labels?: string[];
  created?: string;
  modified?: string;
}

export interface IAnnotations {
  version: string;
  type: string;
  labels: string[];
  annotations: {
    [key: string]: IAnnotation;
  };
}

export interface ITarget {
  id: string;
  x: number;
  y: number;
}

export interface IAnnotation {
  id: string;
  label: string;
  tool?: string;
  targets?: ITarget[];

  // plugins can specify extra keys.
  [key: string]: any;
}
