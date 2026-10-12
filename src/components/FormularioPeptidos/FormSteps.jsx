import {
  FormHeader,
  TextField,
  TextAreaField,
  NumericField,
  NumericInput,
  DniField,
  AgeField,
  RadioGroup,
  CheckboxGroup,
  YesNoField,
} from "./FormFields";
import {
  createTreatmentRow,
  normalizeDiagnosisValues,
} from "./formConfig";
import {
  calculateAgeFromBirthDate,
  getBirthDateForAge,
  getLatestAdultBirthDate,
  isAdultAge,
  isAgeConsistentWithBirthDate,
} from "./birthDateAge";
import ProtectedImage from "../common/ProtectedImage";

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  I. DATOS DE IDENTIFICACIÓN                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepDatosIdentificacion({ formData, updateField, patientSex }) {
  const latestAdultBirthDate = getLatestAdultBirthDate();
  const ageAndBirthDateAreConsistent = isAgeConsistentWithBirthDate(
    formData.fechaNacimiento,
    formData.edad,
  );

  const handleBirthDateChange = (event) => {
    const birthDate = event.target.value;
    const calculatedAge = calculateAgeFromBirthDate(birthDate);

    updateField("fechaNacimiento", birthDate);
    // The date control already limits the selection to adults. The guard also
    // keeps an invalid value injected by an old draft from replacing a valid
    // manual age with an underage value.
    if (calculatedAge !== null && calculatedAge >= 18) {
      updateField("edad", String(calculatedAge));
    }
  };

  const handleAgeChange = (event) => {
    const age = event.target.value;
    updateField("edad", age);

    // AgeField allows partial input while a clinician types (for example,
    // "1" before "18"). Only a complete valid adult age updates the year.
    if (!isAdultAge(age)) return;

    updateField(
      "fechaNacimiento",
      getBirthDateForAge(age, formData.fechaNacimiento),
    );
  };

  return (
    <div className="space-y-5">
      <FormHeader section="I" title="DATOS DE IDENTIFICACIÓN" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Nombre completo"
          name="nombreCompleto"
          value={formData.nombreCompleto}
          onChange={(e) => updateField("nombreCompleto", e.target.value)}
          className="sm:col-span-2"
          required
        />
        <RadioGroup
          label="Sexo"
          name="sexo"
          options={["Femenino", "Masculino"]}
          value={formData.sexo}
          onChange={(e) => updateField("sexo", e.target.value)}
          disabled
          className="sm:col-span-2"
        />
        <p className="-mt-2 text-xs text-slate-400 sm:col-span-2">
          {patientSex
            ? "El sexo se toma del historial del paciente y no puede modificarse aquí."
            : "El sexo aún no está registrado en el historial del paciente."}
        </p>
        <DniField
          label="DNI"
          name="dni"
          value={formData.dni}
          onChange={(e) => updateField("dni", e.target.value)}
        />
        <TextField
          label="Fecha de nacimiento"
          name="fechaNacimiento"
          type="date"
          value={formData.fechaNacimiento}
          onChange={handleBirthDateChange}
          max={latestAdultBirthDate}
          required
        />
        <AgeField
          label="Edad"
          name="edad"
          value={formData.edad}
          onChange={handleAgeChange}
          min={18}
        />
        <div className="-mt-2 space-y-1 text-xs sm:col-span-2">
          <p className="text-slate-400">
            Al elegir la fecha, la edad se calcula automáticamente. Si escribe
            la edad, se ajusta el año necesario y se conserva el mes y día ya
            ingresados; sin una fecha previa se propone el mes y día de hoy
            para que pueda ajustarlos.
          </p>
          {formData.fechaNacimiento &&
            formData.edad &&
            !ageAndBirthDateAreConsistent && (
              <p className="text-rose-300" role="alert">
                La fecha de nacimiento y la edad deben coincidir. Corrige uno
                de los dos campos para sincronizarlos.
              </p>
            )}
        </div>
        <TextField
          label="Teléfono"
          name="telefono"
          value={formData.telefono}
          onChange={(e) => updateField("telefono", e.target.value)}
        />
        <TextField
          label="Ocupación"
          name="ocupacion"
          value={formData.ocupacion}
          onChange={(e) => updateField("ocupacion", e.target.value)}
        />
        <TextField
          label="Fecha de consulta"
          name="fechaConsulta"
          type="date"
          value={formData.fechaConsulta}
          onChange={(e) => updateField("fechaConsulta", e.target.value)}
        />
        <TextField
          label="Médico tratante"
          name="medicoTratante"
          value={formData.medicoTratante}
          onChange={(e) => updateField("medicoTratante", e.target.value)}
          disabled
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  II. MOTIVO DE CONSULTA                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepMotivoConsulta({ formData, updateField }) {
  return (
    <div className="space-y-5">
      <FormHeader section="II" title="MOTIVO DE CONSULTA" />
      <RadioGroup
        label="Motivo principal"
        name="motivoPrincipal"
        options={[
          "Manejo de sobrepeso/obesidad",
          "Reducción de peso",
          "Mejoría metabólica",
          "Diabetes mellitus tipo 2",
          "Otro",
        ]}
        value={formData.motivoPrincipal}
        onChange={(e) => updateField("motivoPrincipal", e.target.value)}
        otherName="motivoOtro"
        otherValue={formData.motivoOtro}
        onOtherChange={(e) => updateField("motivoOtro", e.target.value)}
      />
      <TextAreaField
        label="¿Desde cuándo presenta dificultad para controlar su peso?"
        name="dificultadPeso"
        value={formData.dificultadPeso}
        onChange={(e) => updateField("dificultadPeso", e.target.value)}
        rows={2}
      />
      <TextAreaField
        label="Objetivo del paciente"
        name="objetivoPaciente"
        value={formData.objetivoPaciente}
        onChange={(e) => updateField("objetivoPaciente", e.target.value)}
        rows={2}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  III. HISTORIA Y EVOLUCIÓN DEL PESO                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepHistoriaPeso({ formData, updateField }) {
  return (
    <div className="space-y-5">
      <FormHeader section="III" title="HISTORIA Y EVOLUCIÓN DEL PESO" />
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NumericField
          label="Peso máximo alcanzado (kg)"
          name="pesoMaximo"
          value={formData.pesoMaximo}
          onChange={(e) => updateField("pesoMaximo", e.target.value)}
        />
        <NumericField
          label="Peso habitual (kg)"
          name="pesoHabitual"
          value={formData.pesoHabitual}
          onChange={(e) => updateField("pesoHabitual", e.target.value)}
        />
        <NumericField
          label="Peso actual (kg)"
          name="pesoActual"
          value={formData.pesoActual}
          onChange={(e) => updateField("pesoActual", e.target.value)}
        />
        <NumericField
          label="Talla (m)"
          name="talla"
          value={formData.talla}
          onChange={(e) => updateField("talla", e.target.value)}
        />
        <NumericField
          label="IMC (kg/m²)"
          name="imc"
          value={formData.imc}
          onChange={(e) => updateField("imc", e.target.value)}
        />
        <NumericField
          label="Perímetro abdominal (cm)"
          name="perimetroAbdominal"
          value={formData.perimetroAbdominal}
          onChange={(e) => updateField("perimetroAbdominal", e.target.value)}
        />
      </div>
      <TextAreaField
        label="Evolución del peso / factores asociados"
        name="evolucionPeso"
        value={formData.evolucionPeso}
        onChange={(e) => updateField("evolucionPeso", e.target.value)}
      />
      <RadioGroup
        label="Intentos previos"
        name="intentosPrevios"
        options={[
          "Dieta",
          "Nutricionista",
          "Ejercicio",
          "Medicamentos",
          "Cirugía bariátrica",
          "Otro",
        ]}
        value={formData.intentosPrevios}
        onChange={(e) => updateField("intentosPrevios", e.target.value)}
        otherName="intentosOtros"
        otherValue={formData.intentosOtros}
        onOtherChange={(e) => updateField("intentosOtros", e.target.value)}
      />
      <TextAreaField
        label="Tratamientos previos y respuesta obtenida"
        name="tratamientosPreviosRespuesta"
        value={formData.tratamientosPreviosRespuesta}
        onChange={(e) => updateField("tratamientosPreviosRespuesta", e.target.value)}
        rows={2}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  IV. ANTECEDENTES PERSONALES                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepAntecedentesPersonales({ formData, updateField }) {
  return (
    <div className="space-y-5">
      <FormHeader section="IV" title="ANTECEDENTES PERSONALES" />
      <CheckboxGroup
        label="Enfermedades / antecedentes"
        name="enfermedadesAntecedentes"
        options={[
          "Diabetes mellitus",
          "Prediabetes",
          "Hipertensión",
          "Dislipidemia",
          "Enfermedad tiroidea",
          "Hígado graso/enfermedad hepática",
          "Enfermedad renal",
          "Pancreatitis",
          "Litiasis/enfermedad de vesícula",
          "Enfermedad gastrointestinal",
          "SOP",
          "Enfermedad cardiovascular",
          "Otros",
        ]}
        values={formData.enfermedadesAntecedentes}
        onChange={(vals) => updateField("enfermedadesAntecedentes", vals)}
        otherName="enfermedadesOtros"
        otherValue={formData.enfermedadesOtros}
        onOtherChange={(e) => updateField("enfermedadesOtros", e.target.value)}
      />
      <TextAreaField
        label="Especificar"
        name="enfermedadesEspecificar"
        value={formData.enfermedadesEspecificar}
        onChange={(e) => updateField("enfermedadesEspecificar", e.target.value)}
        rows={2}
      />

      <div className="ui-clinical-group space-y-3">
        <YesNoField
          label="Cirugías previas"
          name="cirugiasPrevias"
          value={formData.cirugiasPrevias}
          onChange={(e) => updateField("cirugiasPrevias", e.target.value)}
        />
        {formData.cirugiasPrevias === "Sí" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 border-l-2 border-indigo-400/20">
            <TextField label="Cirugía/procedimiento" name="cirugiaProcedimiento" value={formData.cirugiaProcedimiento} onChange={(e) => updateField("cirugiaProcedimiento", e.target.value)} />
            <TextField label="Fecha" name="cirugiaFecha" type="date" value={formData.cirugiaFecha} onChange={(e) => updateField("cirugiaFecha", e.target.value)} />
            <YesNoField label="Complicaciones" name="cirugiaComplicaciones" value={formData.cirugiaComplicaciones} onChange={(e) => updateField("cirugiaComplicaciones", e.target.value)} />
          </div>
        )}
      </div>

      <div className="ui-clinical-group space-y-3">
        <YesNoField
          label="Hospitalizaciones previas"
          name="hospitalizacionesPrevias"
          value={formData.hospitalizacionesPrevias}
          onChange={(e) => updateField("hospitalizacionesPrevias", e.target.value)}
        />
        {formData.hospitalizacionesPrevias === "Sí" && (
          <TextField label="Motivo" name="hospitalizacionMotivo" value={formData.hospitalizacionMotivo} onChange={(e) => updateField("hospitalizacionMotivo", e.target.value)} className="pl-2 border-l-2 border-indigo-400/20" />
        )}
      </div>

      <div className="ui-clinical-group space-y-3">
        <YesNoField
          label="Alergia a medicamentos"
          name="alergiaMedicamentos"
          value={formData.alergiaMedicamentos}
          onChange={(e) => updateField("alergiaMedicamentos", e.target.value)}
        />
        {formData.alergiaMedicamentos === "Sí" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 border-l-2 border-indigo-400/20">
            <TextField label="Medicamento" name="alergiaMedicamento" value={formData.alergiaMedicamento} onChange={(e) => updateField("alergiaMedicamento", e.target.value)} />
            <TextField label="Reacción" name="alergiaReaccion" value={formData.alergiaReaccion} onChange={(e) => updateField("alergiaReaccion", e.target.value)} />
          </div>
        )}
      </div>

      <div className="ui-clinical-group space-y-3">
        <YesNoField
          label="Alergias alimentarias"
          name="alergiasAlimentarias"
          value={formData.alergiasAlimentarias}
          onChange={(e) => updateField("alergiasAlimentarias", e.target.value)}
        />
        {formData.alergiasAlimentarias === "Sí" && (
          <TextField label="¿Cuáles?" name="alergiaAlimentariaCual" value={formData.alergiaAlimentariaCual} onChange={(e) => updateField("alergiaAlimentariaCual", e.target.value)} className="pl-2 border-l-2 border-indigo-400/20" />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="ui-clinical-group space-y-3">
          <YesNoField label="Alergia a látex" name="alergiaLatex" value={formData.alergiaLatex} onChange={(e) => updateField("alergiaLatex", e.target.value)} />
          {formData.alergiaLatex === "Sí" && (
            <TextField label="Otras" name="alergiaLatexOtras" value={formData.alergiaLatexOtras} onChange={(e) => updateField("alergiaLatexOtras", e.target.value)} className="pl-2 border-l-2 border-indigo-400/20" />
          )}
        </div>

        <div className="ui-clinical-group space-y-3">
          <YesNoField label="Reacciones adversas a medicamentos" name="reaccionesAdversas" value={formData.reaccionesAdversas} onChange={(e) => updateField("reaccionesAdversas", e.target.value)} />
          {formData.reaccionesAdversas === "Sí" && (
            <TextField label="Medicamento/reacción" name="reaccionAdversaMedicamento" value={formData.reaccionAdversaMedicamento} onChange={(e) => updateField("reaccionAdversaMedicamento", e.target.value)} className="pl-2 border-l-2 border-indigo-400/20" />
          )}
        </div>
      </div>

      <YesNoField
        label="Transfusiones sanguíneas"
        name="transfusionesSanguineas"
        value={formData.transfusionesSanguineas}
        onChange={(e) => updateField("transfusionesSanguineas", e.target.value)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  V. ANTECEDENTES FAMILIARES                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepAntecedentesFamiliares({ formData, updateField }) {
  return (
    <div className="space-y-5">
      <FormHeader section="V" title="ANTECEDENTES FAMILIARES" />
      <CheckboxGroup
        label="Antecedentes familiares"
        name="antecedentesFamiliares"
        options={[
          "Obesidad",
          "Diabetes mellitus",
          "Hipertensión",
          "Enfermedad cardiovascular",
          "Enfermedad tiroidea",
          "Carcinoma medular de tiroides",
          "MEN 2 (neoplasia endocrina múltiple tipo 2)",
          "Otros",
        ]}
        values={formData.antecedentesFamiliares}
        onChange={(vals) => updateField("antecedentesFamiliares", vals)}
        otherName="familiaresOtros"
        otherValue={formData.familiaresOtros}
        onOtherChange={(e) => updateField("familiaresOtros", e.target.value)}
      />
      <TextAreaField
        label="Especificar antecedentes relevantes"
        name="familiaresEspecificar"
        value={formData.familiaresEspecificar}
        onChange={(e) => updateField("familiaresEspecificar", e.target.value)}
        rows={2}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  VI. ANTECEDENTES GINECO-OBSTÉTRICOS                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepGinecoObstetricos({ formData, updateField }) {
  return (
    <div className="space-y-5">
      <FormHeader section="VI" title="ANTECEDENTES GINECO-OBSTÉTRICOS" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <TextField label="FUM" name="fum" value={formData.fum} onChange={(e) => updateField("fum", e.target.value)} />
        <TextField label="G" name="g" value={formData.g} onChange={(e) => updateField("g", e.target.value)} />
        <TextField label="P" name="p" value={formData.p} onChange={(e) => updateField("p", e.target.value)} />
        <TextField label="C" name="c" value={formData.c} onChange={(e) => updateField("c", e.target.value)} />
        <TextField label="A" name="a" value={formData.a} onChange={(e) => updateField("a", e.target.value)} />
      </div>
      <TextField
        label="Método anticonceptivo"
        name="metodoAnticonceptivo"
        value={formData.metodoAnticonceptivo}
        onChange={(e) => updateField("metodoAnticonceptivo", e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <YesNoField label="Embarazo actual" name="embarazoActual" value={formData.embarazoActual} onChange={(e) => updateField("embarazoActual", e.target.value)} />
        <YesNoField label="Posibilidad de embarazo" name="posibilidadEmbarazo" value={formData.posibilidadEmbarazo} onChange={(e) => updateField("posibilidadEmbarazo", e.target.value)} />
        <YesNoField label="Lactancia" name="lactancia" value={formData.lactancia} onChange={(e) => updateField("lactancia", e.target.value)} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  VII. MEDICACIÓN ACTUAL Y TRATAMIENTOS PREVIOS                             */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepMedicacionActual({ formData, updateField }) {
  const treatmentRows =
    Array.isArray(formData.tratamientosPreviosPeso) &&
    formData.tratamientosPreviosPeso.length > 0
      ? formData.tratamientosPreviosPeso
      : [createTreatmentRow()];

  const updateTratamiento = (index, field, value) => {
    const updated = [...treatmentRows];
    updated[index] = { ...updated[index], [field]: value };
    updateField("tratamientosPreviosPeso", updated);
  };

  const addRow = () => {
    updateField("tratamientosPreviosPeso", [
      ...treatmentRows,
      createTreatmentRow(),
    ]);
  };

  const removeRow = (index) => {
    if (treatmentRows.length <= 1) return;
    updateField(
      "tratamientosPreviosPeso",
      treatmentRows.filter((_, rowIndex) => rowIndex !== index),
    );
  };

  return (
    <div className="space-y-5">
      <FormHeader section="VII" title="MEDICACIÓN ACTUAL Y TRATAMIENTOS PREVIOS" />
      <TextAreaField
        label="Medicamentos actuales"
        name="medicamentosActuales"
        value={formData.medicamentosActuales}
        onChange={(e) => updateField("medicamentosActuales", e.target.value)}
        rows={2}
      />
      <TextAreaField
        label="Suplementos / vitaminas"
        name="suplementosVitaminas"
        value={formData.suplementosVitaminas}
        onChange={(e) => updateField("suplementosVitaminas", e.target.value)}
        rows={2}
      />

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">
          Tratamientos previos para control de peso
        </label>
        <div className="ui-table-wrap" role="region" aria-label="Tratamientos previos para control de peso" tabIndex={0}>
          <table className="ui-table ui-clinical-table text-sm">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
                <th scope="col" className="px-3 py-2.5 text-left">Medicamento</th>
                <th scope="col" className="px-3 py-2.5 text-left">Dosis</th>
                <th scope="col" className="px-3 py-2.5 text-left">Tiempo de uso</th>
                <th scope="col" className="px-3 py-2.5 text-left">Resultado / efectos adversos</th>
                <th scope="col" className="w-28 px-3 py-2.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {treatmentRows.map((row, i) => (
                <tr key={i} className="border-t border-slate-700/40">
                  <td className="p-1.5">
                  <input type="text" aria-label={`Medicamento o tratamiento previo ${i + 1}`} name={`tratamientosPreviosPeso-${i}-medicamento`} value={row.medicamento || ""} onChange={(e) => updateTratamiento(i, "medicamento", e.target.value)} className="ui-control min-w-28 text-sm" />
                  </td>
                  <td className="p-1.5">
                    <input type="text" aria-label={`Dosis del tratamiento previo ${i + 1}`} name={`tratamientosPreviosPeso-${i}-dosis`} value={row.dosis || ""} onChange={(e) => updateTratamiento(i, "dosis", e.target.value)} className="ui-control min-w-28 text-sm" />
                  </td>
                  <td className="p-1.5">
                    <input type="text" aria-label={`Tiempo de uso del tratamiento previo ${i + 1}`} name={`tratamientosPreviosPeso-${i}-tiempoUso`} value={row.tiempoUso || ""} onChange={(e) => updateTratamiento(i, "tiempoUso", e.target.value)} className="ui-control min-w-28 text-sm" />
                  </td>
                  <td className="p-1.5">
                    <input type="text" aria-label={`Resultado del tratamiento previo ${i + 1}`} name={`tratamientosPreviosPeso-${i}-resultado`} value={row.resultado || ""} onChange={(e) => updateTratamiento(i, "resultado", e.target.value)} className="ui-control min-w-28 text-sm" />
                  </td>
                  <td className="p-1.5 text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      disabled={treatmentRows.length === 1}
                      className="ui-button ui-button-danger text-xs disabled:opacity-40"
                      title={
                        treatmentRows.length === 1
                          ? "Debe mantenerse al menos una fila"
                          : "Eliminar fila"
                      }
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={addRow} className="ui-button ui-button-secondary">
          Agregar fila
        </button>
      </div>

      <div className="ui-clinical-group space-y-3">
        <YesNoField
          label="¿Ha utilizado previamente agonistas GLP-1/GIP?"
          name="agonistasGlp1"
          value={formData.agonistasGlp1}
          onChange={(e) => updateField("agonistasGlp1", e.target.value)}
        />
        {formData.agonistasGlp1 === "Sí" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-2 border-l-2 border-indigo-400/20">
            <TextField label="Medicamento" name="agonistaMedicamento" value={formData.agonistaMedicamento} onChange={(e) => updateField("agonistaMedicamento", e.target.value)} />
            <TextField label="Dosis" name="agonistaDosis" value={formData.agonistaDosis} onChange={(e) => updateField("agonistaDosis", e.target.value)} />
            <TextField label="Respuesta/tolerancia" name="agonistaRespuesta" value={formData.agonistaRespuesta} onChange={(e) => updateField("agonistaRespuesta", e.target.value)} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  VIII. HÁBITOS Y ESTILO DE VIDA                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepHabitosEstilo({ formData, updateField }) {
  return (
    <div className="space-y-5">
      <FormHeader section="VIII" title="HÁBITOS Y ESTILO DE VIDA" />
      <RadioGroup
        label="Alimentación habitual"
        name="alimentacionHabitual"
        options={["Adecuada", "Irregular", "Poco saludable", "Sin cambios relevantes"]}
        value={formData.alimentacionHabitual}
        onChange={(e) => updateField("alimentacionHabitual", e.target.value)}
      />
      <TextField
        label="Número aproximado de comidas al día"
        name="comidasDia"
        value={formData.comidasDia}
        onChange={(e) => updateField("comidasDia", e.target.value)}
      />
      <RadioGroup
        label="Sensación de hambre habitual"
        name="sensacionHambre"
        options={["Baja", "Normal", "Aumentada", "Variable"]}
        value={formData.sensacionHambre}
        onChange={(e) => updateField("sensacionHambre", e.target.value)}
      />
      <YesNoField
        label="Antojos / picoteo frecuente"
        name="antojosPicoteo"
        value={formData.antojosPicoteo}
        onChange={(e) => updateField("antojosPicoteo", e.target.value)}
      />

      <div className="ui-clinical-group space-y-3">
        <RadioGroup
          label="Actividad física"
          name="actividadFisica"
          options={["No realiza", "Ocasional", "Regular"]}
          value={formData.actividadFisica}
          onChange={(e) => updateField("actividadFisica", e.target.value)}
        />
        {formData.actividadFisica === "Regular" && (
          <TextField label="Frecuencia (veces/semana)" name="actividadFrecuencia" value={formData.actividadFrecuencia} onChange={(e) => updateField("actividadFrecuencia", e.target.value)} className="pl-2 border-l-2 border-indigo-400/20" />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Horas de sueño (horas/noche)"
          name="horasSueno"
          value={formData.horasSueno}
          onChange={(e) => updateField("horasSueno", e.target.value)}
        />
        <RadioGroup
          label="Calidad del sueño"
          name="calidadSueno"
          options={["Buena", "Regular", "Mala"]}
          value={formData.calidadSueno}
          onChange={(e) => updateField("calidadSueno", e.target.value)}
        />
      </div>

      <RadioGroup
        label="Consumo de alcohol"
        name="consumoAlcohol"
        options={["No", "Ocasional", "Frecuente"]}
        value={formData.consumoAlcohol}
        onChange={(e) => updateField("consumoAlcohol", e.target.value)}
      />
      <TextAreaField
        label="Observaciones relevantes"
        name="observacionesHabitos"
        value={formData.observacionesHabitos}
        onChange={(e) => updateField("observacionesHabitos", e.target.value)}
        rows={2}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  IX. SÍNTOMAS ACTUALES                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepSintomasActuales({ formData, updateField }) {
  return (
    <div className="space-y-5">
      <FormHeader section="IX" title="SÍNTOMAS ACTUALES" />
      <CheckboxGroup
        label="Síntomas presentes"
        name="sintomasActuales"
        options={[
          "Náuseas",
          "Vómitos",
          "Diarrea",
          "Estreñimiento",
          "Reflujo/dispepsia",
          "Dolor abdominal",
          "Dolor en hipocondrio derecho",
          "Distensión abdominal",
          "Ninguno",
        ]}
        values={formData.sintomasActuales}
        onChange={(vals) => updateField("sintomasActuales", vals)}
      />
      <TextAreaField
        label="Otros síntomas relevantes"
        name="otrosSintomas"
        value={formData.otrosSintomas}
        onChange={(e) => updateField("otrosSintomas", e.target.value)}
        rows={2}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  X. EVALUACIÓN DE SEGURIDAD PREVIA AL INICIO                               */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepEvaluacionSeguridad({ formData, updateField }) {
  const Section = ({ title, children }) => (
    <div className="ui-clinical-group space-y-3">
      <p className="text-sm font-semibold text-indigo-200/90">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );

  return (
    <div className="space-y-5">
      <FormHeader section="X" title="EVALUACIÓN DE SEGURIDAD PREVIA AL INICIO" />
      <Section title="Antecedentes tiroideos">
        <YesNoField label="Carcinoma medular de tiroides personal" name="carcinomaMedularPersonal" value={formData.carcinomaMedularPersonal} onChange={(e) => updateField("carcinomaMedularPersonal", e.target.value)} />
        <YesNoField label="Familiar" name="carcinomaMedularFamiliar" value={formData.carcinomaMedularFamiliar} onChange={(e) => updateField("carcinomaMedularFamiliar", e.target.value)} />
        <YesNoField label="MEN 2 personal/familiar" name="men2PersonalFamiliar" value={formData.men2PersonalFamiliar} onChange={(e) => updateField("men2PersonalFamiliar", e.target.value)} />
        <YesNoField label="Enfermedad tiroidea conocida" name="enfermedadTiroideaConocida" value={formData.enfermedadTiroideaConocida} onChange={(e) => updateField("enfermedadTiroideaConocida", e.target.value)} />
      </Section>

      <Section title="Antecedentes pancreáticos">
        <YesNoField label="Pancreatitis previa" name="pancreatitisPrevia" value={formData.pancreatitisPrevia} onChange={(e) => updateField("pancreatitisPrevia", e.target.value)} />
        <YesNoField label="Dolor abdominal intenso/recurrente" name="dolorAbdominalRecurrente" value={formData.dolorAbdominalRecurrente} onChange={(e) => updateField("dolorAbdominalRecurrente", e.target.value)} />
      </Section>

      <Section title="Antecedentes hepatobiliares">
        <YesNoField label="Litiasis vesicular" name="litiasisVesicular" value={formData.litiasisVesicular} onChange={(e) => updateField("litiasisVesicular", e.target.value)} />
        <YesNoField label="Colecistitis" name="colecistitis" value={formData.colecistitis} onChange={(e) => updateField("colecistitis", e.target.value)} />
        <YesNoField label="Cirugía de vesícula" name="cirugiaVesicula" value={formData.cirugiaVesicula} onChange={(e) => updateField("cirugiaVesicula", e.target.value)} />
        <YesNoField label="Enfermedad hepática" name="enfermedadHepatica" value={formData.enfermedadHepatica} onChange={(e) => updateField("enfermedadHepatica", e.target.value)} />
        <YesNoField label="Ictericia previa" name="ictericiaPrevia" value={formData.ictericiaPrevia} onChange={(e) => updateField("ictericiaPrevia", e.target.value)} />
      </Section>

      <Section title="Antecedentes gastrointestinales">
        <YesNoField label="Gastroparesia diagnosticada" name="gastroparesia" value={formData.gastroparesia} onChange={(e) => updateField("gastroparesia", e.target.value)} />
        <YesNoField label="Enfermedad GI importante" name="enfermedadGiImportante" value={formData.enfermedadGiImportante} onChange={(e) => updateField("enfermedadGiImportante", e.target.value)} />
      </Section>

      <Section title="Antecedentes renales/metabólicos">
        <YesNoField label="Enfermedad renal" name="enfermedadRenal" value={formData.enfermedadRenal} onChange={(e) => updateField("enfermedadRenal", e.target.value)} />
        <YesNoField label="Deshidratación reciente" name="deshidratacionReciente" value={formData.deshidratacionReciente} onChange={(e) => updateField("deshidratacionReciente", e.target.value)} />
        <YesNoField label="Hipoglucemias previas" name="hipoglucemiasPrevias" value={formData.hipoglucemiasPrevias} onChange={(e) => updateField("hipoglucemiasPrevias", e.target.value)} />
      </Section>

      <Section title="Medicamentos relevantes">
        <YesNoField label="Insulina" name="insulina" value={formData.insulina} onChange={(e) => updateField("insulina", e.target.value)} />
        <YesNoField label="Sulfonilureas" name="sulfonilureas" value={formData.sulfonilureas} onChange={(e) => updateField("sulfonilureas", e.target.value)} />
        <YesNoField label="Otros medicamentos para diabetes" name="otrosMedDiabetes" value={formData.otrosMedDiabetes} onChange={(e) => updateField("otrosMedDiabetes", e.target.value)} />
        <YesNoField label="Otros medicamentos para pérdida de peso" name="otrosMedPeso" value={formData.otrosMedPeso} onChange={(e) => updateField("otrosMedPeso", e.target.value)} />
      </Section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  XI. EVALUACIÓN CLÍNICA                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepEvaluacionClinica({ formData, updateField }) {
  return (
    <div className="space-y-5">
      <FormHeader section="XI" title="EVALUACIÓN CLÍNICA" />
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">Presión arterial (mmHg)</label>
          <div className="flex items-center gap-2">
            <NumericInput
              name="presionSistolica"
              value={formData.presionSistolica}
              onChange={(e) => updateField("presionSistolica", e.target.value)}
              placeholder="Sistólica"
              ariaLabel="Presión sistólica"
            />
            <span className="text-slate-400">/</span>
            <NumericInput
              name="presionDiastolica"
              value={formData.presionDiastolica}
              onChange={(e) => updateField("presionDiastolica", e.target.value)}
              placeholder="Diastólica"
              ariaLabel="Presión diastólica"
            />
          </div>
        </div>
        <NumericField label="Frecuencia cardíaca (lpm)" name="frecuenciaCardiaca" value={formData.frecuenciaCardiaca} onChange={(e) => updateField("frecuenciaCardiaca", e.target.value)} />
        <NumericField label="Peso (kg)" name="pesoClinico" value={formData.pesoClinico} onChange={(e) => updateField("pesoClinico", e.target.value)} />
        <NumericField label="Talla (m)" name="tallaClinica" value={formData.tallaClinica} onChange={(e) => updateField("tallaClinica", e.target.value)} />
        <NumericField label="IMC (kg/m²)" name="imcClinico" value={formData.imcClinico} onChange={(e) => updateField("imcClinico", e.target.value)} />
        <NumericField label="Perímetro abdominal (cm)" name="perimetroAbdominalClinico" value={formData.perimetroAbdominalClinico} onChange={(e) => updateField("perimetroAbdominalClinico", e.target.value)} />
      </div>
      <TextAreaField
        label="Examen físico relevante"
        name="examenFisico"
        value={formData.examenFisico}
        onChange={(e) => updateField("examenFisico", e.target.value)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  XII. EXÁMENES AUXILIARES                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepExamenesAuxiliares({ formData, updateField }) {
  return (
    <div className="space-y-5">
      <FormHeader section="XII" title="EXÁMENES AUXILIARES" />
      <TextField
        label="Fecha de laboratorio"
        name="fechaLaboratorio"
        type="date"
        value={formData.fechaLaboratorio}
        onChange={(e) => updateField("fechaLaboratorio", e.target.value)}
      />
      <div className="ui-table-wrap" role="region" aria-label="Exámenes auxiliares" tabIndex={0}>
        <table className="ui-table ui-clinical-table text-sm">
          <thead>
            <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
              <th scope="col" className="px-3 py-2.5 text-left">Examen</th>
              <th scope="col" className="px-3 py-2.5 text-left">Resultado</th>
              <th scope="col" className="px-3 py-2.5 text-left">Examen</th>
              <th scope="col" className="px-3 py-2.5 text-left">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Glucosa en ayunas", "glucosaAyunas", "HbA1c", "hba1c"],
              ["Creatinina", "creatinina", "TFGe / eGFR", "tfge"],
              ["TGO / AST", "tgoAst", "TGP / ALT", "tgpAlt"],
              ["Colesterol total", "colesterolTotal", "LDL", "ldl"],
              ["HDL", "hdl", "Triglicéridos", "trigliceridos"],
              ["TSH", "tsh", "Otros", "otrosExamenes"],
            ].map(([label1, key1, label2, key2], i) => (
              <tr key={i} className="border-t border-slate-700/40">
                <td className="px-3 py-2 text-slate-300 text-sm whitespace-nowrap">{label1}</td>
                <td className="p-1.5">
                  <input type="text" aria-label={label1} name={key1} value={formData[key1]} onChange={(e) => updateField(key1, e.target.value)} className="ui-control min-w-28 text-sm" />
                </td>
                <td className="px-3 py-2 text-slate-300 text-sm whitespace-nowrap">{label2}</td>
                <td className="p-1.5">
                  <input type="text" aria-label={label2} name={key2} value={formData[key2]} onChange={(e) => updateField(key2, e.target.value)} className="ui-control min-w-28 text-sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  XIII. EVALUACIÓN MÉDICA                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepEvaluacionMedica({ formData, updateField }) {
  const diagnosticos = normalizeDiagnosisValues(formData);

  const updateDiagnostico = (index, value) => {
    const updated = [...diagnosticos];
    updated[index] = value;
    updateField("diagnosticos", updated);
  };

  const addDiagnostico = () => {
    updateField("diagnosticos", [...diagnosticos, ""]);
  };

  const removeDiagnostico = (index) => {
    if (diagnosticos.length <= 1) return;
    updateField(
      "diagnosticos",
      diagnosticos.filter((_, diagnosisIndex) => diagnosisIndex !== index),
    );
  };

  return (
    <div className="space-y-5">
      <FormHeader section="XIII" title="EVALUACIÓN MÉDICA" />
      <div className="space-y-3" data-form-field="diagnosticos">
        <label className="block text-sm font-medium text-slate-300">
          Diagnóstico / impresión diagnóstica
        </label>
        {diagnosticos.map((diagnostico, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-5 text-sm text-slate-400">{index + 1}.</span>
            <input
              type="text"
              aria-label={`Diagnóstico ${index + 1}`}
              name={`diagnosticos-${index}`}
              value={diagnostico}
              onChange={(e) => updateDiagnostico(index, e.target.value)}
              className="ui-control"
            />
            <button
              type="button"
              onClick={() => removeDiagnostico(index)}
              disabled={diagnosticos.length === 1}
              className="ui-button ui-button-danger shrink-0 text-xs disabled:opacity-40"
              title={
                diagnosticos.length === 1
                  ? "Debe mantenerse al menos un diagnóstico"
                  : "Quitar diagnóstico"
              }
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addDiagnostico}
          className="ui-button ui-button-secondary"
        >
          Agregar diagnóstico
        </button>
      </div>
      <TextAreaField
        label="Comorbilidades asociadas"
        name="comorbilidades"
        value={formData.comorbilidades}
        onChange={(e) => updateField("comorbilidades", e.target.value)}
        rows={2}
      />
      <TextAreaField
        label="Factores de riesgo identificados"
        name="factoresRiesgo"
        value={formData.factoresRiesgo}
        onChange={(e) => updateField("factoresRiesgo", e.target.value)}
        rows={2}
      />
      <TextAreaField
        label="Observaciones clínicas"
        name="observacionesClinicas"
        value={formData.observacionesClinicas}
        onChange={(e) => updateField("observacionesClinicas", e.target.value)}
        rows={2}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  XIV. CONDUCTA Y PLAN                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepConductaPlan({ formData, updateField }) {
  return (
    <div className="space-y-5">
      <FormHeader section="XIV" title="CONDUCTA Y PLAN" />
      <CheckboxGroup
        label="Conducta"
        name="conductaPlan"
        options={[
          "Iniciar tratamiento farmacológico",
          "Solicitar estudios adicionales",
          "Manejo nutricional",
          "Actividad física",
          "Interconsulta/derivación",
          "Diferir inicio",
          "No iniciar por el momento",
          "Otros",
        ]}
        values={formData.conductaPlan}
        onChange={(vals) => updateField("conductaPlan", vals)}
        otherName="conductaOtro"
        otherValue={formData.conductaOtro}
        onOtherChange={(e) => updateField("conductaOtro", e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="Medicamento indicado" name="medicamentoIndicado" value={formData.medicamentoIndicado} onChange={(e) => updateField("medicamentoIndicado", e.target.value)} />
        <TextField label="Presentación" name="presentacion" value={formData.presentacion} onChange={(e) => updateField("presentacion", e.target.value)} />
        <TextField label="Dosis inicial" name="dosisInicial" value={formData.dosisInicial} onChange={(e) => updateField("dosisInicial", e.target.value)} />
        <TextField label="Fecha prevista de inicio" name="fechaInicioTratamiento" type="date" value={formData.fechaInicioTratamiento} onChange={(e) => updateField("fechaInicioTratamiento", e.target.value)} />
        <TextField label="Próximo control" name="proximoControl" type="date" value={formData.proximoControl} onChange={(e) => updateField("proximoControl", e.target.value)} />
      </div>
      <TextAreaField
        label="Indicaciones / observaciones"
        name="indicacionesObservaciones"
        value={formData.indicacionesObservaciones}
        onChange={(e) => updateField("indicacionesObservaciones", e.target.value)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  XV. CONSTANCIA MÉDICA                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */
export function StepConstanciaMedica({ formData, updateField, firmaDigitalUrl }) {
  return (
    <div className="space-y-5">
      <FormHeader section="XV" title="CONSTANCIA MÉDICA" />

      <div className="ui-clinical-group space-y-3">
        <RadioGroup
          label="Consentimiento informado específico"
          name="consentimientoInformado"
          options={["Firmado", "Pendiente"]}
          value={formData.consentimientoInformado}
          onChange={(e) => updateField("consentimientoInformado", e.target.value)}
        />
        <TextField
          label="Fecha"
          name="consentimientoFecha"
          type="date"
          value={formData.consentimientoFecha}
          onChange={(e) => updateField("consentimientoFecha", e.target.value)}
        />
      </div>

      <TextAreaField
        label="Observaciones adicionales"
        name="observacionesAdicionales"
        value={formData.observacionesAdicionales}
        onChange={(e) => updateField("observacionesAdicionales", e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField
          label="Nombre y firma del médico"
          name="nombreFirmaMedico"
          value={formData.nombreFirmaMedico}
          onChange={(e) => updateField("nombreFirmaMedico", e.target.value)}
          disabled
        />
        <TextField
          label="CMP"
          name="cmpConstancia"
          value={formData.cmpConstancia}
          onChange={(e) => updateField("cmpConstancia", e.target.value)}
          disabled
        />
      </div>

      {/* Firma digital image */}
      {firmaDigitalUrl && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">Firma digital</label>
          <div className="flex min-h-28 items-center justify-center rounded-lg border border-slate-700 bg-white p-4">
            <ProtectedImage src={firmaDigitalUrl} alt="Firma digital del médico" className="max-h-20 object-contain" />
          </div>
        </div>
      )}

      <TextField
        label="Fecha"
        name="fechaConstancia"
        type="date"
        value={formData.fechaConstancia}
        onChange={(e) => updateField("fechaConstancia", e.target.value)}
      />

      <div className="p-4 rounded-lg border border-amber-400/20 bg-amber-400/5">
        <p className="text-xs text-amber-200/80 leading-relaxed">
          <strong>Nota:</strong> Este documento corresponde a la historia clínica inicial.
          El consentimiento informado detallado sobre beneficios, riesgos, efectos adversos y
          criterios de suspensión se maneja en una hoja independiente, y la evolución semanal
          se registra en una ficha de control separada.
        </p>
      </div>
    </div>
  );
}
