export type CampusType = "Talisay" | "Fortune Towne" | "Binalbagan" | "Alijis";

export const detectCampus = (): CampusType => {
  const origin = window.location.origin;

  if (origin.includes("cpveris-fortunetowne.chmsu.edu.ph")) {
    return "Fortune Towne";
  }
  if (origin.includes("cpveris-binalbagan.chmsu.edu.ph")) {
    return "Binalbagan";
  }
  if (origin.includes("cpveris-alijis.chmsu.edu.ph")) {
    return "Alijis";
  }
  
  // Default to Talisay for localhost and cpveris-talisay.chmsu.edu.ph
  return "Talisay";
};


export const getCampus = () => {
  const origin = window.location.origin;

  if (origin.includes("cpveris-fortunetowne.chmsu.edu.ph")) {
    return "Fortune Towne Campus";
  }
  if (origin.includes("cpveris-binalbagan.chmsu.edu.ph")) {
    return "Binalbagan Campus";
  }
  if (origin.includes("cpveris-alijis.chmsu.edu.ph")) {
    return "Alijis Campus";
  }
  
  // Default to Talisay for localhost and cpveris-talisay.chmsu.edu.ph
  return "Talisay (Main) Campus";
};