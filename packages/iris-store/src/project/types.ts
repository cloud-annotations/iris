export interface IProject {
  id: string;
  name: string;
  created: string;
}

export interface IAnnotations {
  version: string;
  type: string;
  labels: string[];
  annotations: {
    [key: string]: IAnnotation;
  };
}

export interface IAnnotation {
  x?: number;
  y?: number;
  x2?: number;
  y2?: number;
  label: string;
}
