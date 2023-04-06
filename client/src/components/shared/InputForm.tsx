import Utils from "@utils/utils";

interface InputFormProps {
  label?: string;
  type: string;
  name: string;
  placeholder: string;
  value: string;
  updateValue: (value: string) => void;
  inputClasses?: string;
  componentClasses?: string;
  fullWidth?: boolean;
}

const InputForm: React.FC<InputFormProps> = (props) => {
  return (
    <div className={`mx-2 ${Utils.classNames(props.componentClasses)}`}>
      {props.label && (
        <label
          htmlFor={props.name}
          className="block text-sm font-medium text-gray-700"
        >
          {props.label}
        </label>
      )}
      <div className={``}>
        <input
          type={props.type}
          name={props.name}
          id={props.name}
          defaultValue={props.value}
          className={`shadow-md !focus-visible:ring-theme-300 !focus-visible:shadow-none block pl-3 pr-10 py-2
             ${
               props.fullWidth ? `w-full` : `w-max`
             } sm:text-sm border-gray-400 rounded-md ${Utils.classNames(
            props.inputClasses
          )} `}
          placeholder={props.placeholder}
          onChange={(e) => props.updateValue(e.target.value)}
        />
      </div>
    </div>
  );
};

export default InputForm;
