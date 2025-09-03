
export enum CameraAngle {
  LeftSide = "Left Side",
  RightSide = "Right Side",
  Front = "Front View",
}

export enum CameraShot {
  CloseUp = "Close-up Shot",
  Medium = "Medium Shot",
  Full = "Full Shot",
  Drone = "Drone Shot",
}

export enum CameraLevel {
  EyeLevel = "Eye-level",
  LowAngle = "Low-angle",
  HighAngle = "High-angle",
}

export interface GeneratedImage {
  src: string;
  prompt: string;
}
