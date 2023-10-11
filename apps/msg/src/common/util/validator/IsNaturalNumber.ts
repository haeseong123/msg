import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { isNaturalNumber } from '../isNaturalNumber';

@ValidatorConstraint({ name: 'IsNaturalNumber', async: false })
export class IsNaturalNumber implements ValidatorConstraintInterface {
    validate(text: string, args: ValidationArguments) {
        return isNaturalNumber(text);
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.targetName}: ${args.value}는 자연수가 아닙니다.`;
    }
}