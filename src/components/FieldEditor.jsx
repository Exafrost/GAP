import { pluralSimple } from "../lib/format";
import FieldInput from "./FieldInput";

export default function FieldEditor({scoreField, setScoreFields}){
    const rankingId = scoreField.find((f) => f.ranks)?.id ?? '';
    
    const addScoreField = () => {
        const newId = Math.max(0, ...scoreField.map((f) => f.id)) + 1;
        setScoreFields([...scoreField, {id: newId, key:"", name:"", required:true, type:"player", computeFunction:"", iconPath:"", ranks: false}])
    };

    const removeScoreField = (id) => setScoreFields((fields) => fields.filter((f) => f.id !== id))
    const updateScoreField = (id, changes) => setScoreFields((fields) => fields.map((f) => (f.id === id ? { ...f, ...changes } : f)));

    const setRanking = (id) => setScoreFields((fields) => fields.map((f) => ({ ...f, ranks: f.id === id })));

    return (
    <div>
        <label>{pluralSimple(scoreField.length,"Champ")} de score <span className='muted'>facultatif</span></label>
        <button className='button button-seconday' type="button" onClick={() => addScoreField()}>Ajouter un champ</button>
        {scoreField.map((field) => (<FieldInput key={field.id} field={field} removeField={removeScoreField} updateField={updateScoreField} />))}
        {scoreField.length > 0 && (
        <div>
            <label htmlFor="ranking">Champ de classement</label>
            <select id="ranking" value={rankingId} required onChange={(e) => setRanking(Number(e.target.value))}>
            <option value="">Choisir un champ…</option>
            {scoreField.map((field) => (
                <option key={field.id} value={field.id}>{field.name || `Champ ${field.id}`}</option>
            ))}
            </select>
        </div>
        )}
    </div>)
}