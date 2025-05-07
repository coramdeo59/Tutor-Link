import { StateDto } from './state.dto';

export class CountryWithStatesDto {
  id: number;
  name: string;
  states: StateDto[];
}
