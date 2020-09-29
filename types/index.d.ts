export interface Project {
  id: string;
  name: string;
  created: string;
}

export interface Annotations {
  version: string;
  type: string;
  labels: string[];
  annotations: {
    [key: string]: Annotation;
  };
}

export interface Annotation {
  x?: number;
  y?: number;
  x2?: number;
  y2?: number;
  label: string;
}
