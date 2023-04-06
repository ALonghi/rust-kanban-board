import Utils from "../../utils/utils";

interface InputFormProps {
  label: string;
  type: string;
  name: string;
  placeholder: string;
  value: string;
  updateValue: (value: string) => void;
  inputClasses?: string;
  componentClasses?: string;
}

const InputForm: React.FC<InputFormProps> = (props) => {
  return (
    <div className={`mx-2 ${Utils.classNames(props.componentClasses)}`}>
      <label
        htmlFor={props.name}
        className="block text-sm font-medium text-gray-700"
      >
        {props.label}
      </label>
      <div className={``}>
        <input
          type={props.type}
          name={props.name}
          id={props.name}
          defaultValue={props.value}
          className={`shadow-md focus:ring-theme-700 focus:border-theme-700 block pl-3 pr-10 py-2
             w-max sm:text-sm border-gray-400 rounded-md ${Utils.classNames(
               props.inputClasses
             )}`}
          placeholder={props.placeholder}
          onChange={(e) => props.updateValue(e.target.value)}
        />
      </div>
    </div>
  );
};

export default InputForm;
