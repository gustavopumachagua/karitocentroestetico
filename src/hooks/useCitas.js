import { useContext } from "react";
import { CitasContext } from "../context/citas.context";

export const useCitas = () => useContext(CitasContext);
