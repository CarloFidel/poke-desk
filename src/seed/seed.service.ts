import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { PokeResponse } from './interfaces/poke-response.interfaces';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { AxiosAdapter } from '../common/adapters/axios-adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name) //IncetModel es un decorador nativo de nest para poder hacer la inyección de modelos en el service
    private readonly pokemonModel: Model<Pokemon>,

      private readonly http: AxiosAdapter// Esto que se ha hecho es un adapter para modularizar el uso de axios, 
      // Si mañana axios cambia, solamente habría que ir aladapter y modificarlo allí, no habría que tocar este código.

  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({});

    const  data  = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=100',
    );

    const pokemonToInsert: { name: string; no: number }[] = []; //Esa interfce se puede crear asi en linea o se puede traer de un archivo externo

    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];

      pokemonToInsert.push({ name, no });
    });

    await this.pokemonModel.insertMany(pokemonToInsert);

    return data.results;
  }
}
