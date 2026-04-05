import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';

import { isValidObjectId, Model } from 'mongoose';

import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name) //IncetModel es un decorador nativo de nest para poder hacer la inyección de modelos en el service
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ) {
   
    this.defaultLimit = configService.get<number>('difaultLimit')!
   
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error: any) {
      this.handleExceptions(error);
      //Cuando se lanza un throw el código no continúa ejecutándose
    }
  }

  findAll(paginationDto: PaginationDto) {

    const { limit = this.defaultLimit, offset = 0 } = paginationDto;

    return this.pokemonModel.find().limit(limit).skip(offset);
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null = null;

    if (!isNaN(+term)) {
      //Si el term es un número me hace la búsqueda por la columna no
      pokemon = await this.pokemonModel.findOne({ no: +term });
    }

    //MongoID
    //Si es un id valido ( en este caso de mongo) me hace la busqueda por la columna id
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    //Name
    //Si las dos anteriores búsquedas no se ejecutaron porque no encontró nada en la base de datos, solo me falta que intente
    //buscar por la columna name
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: term.toLocaleLowerCase(),
      });
    }
    //Si ninguna de las tres columnas que tiene la base de dato encontró una coincidencia con el term, entonces no existe ningún pokemon
    //y me devuelve la ecepción
    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon with id, name or no "${term}" was not found`,
      );
    }
    //Nota: Hay que prestar mucha atención a la manera de validar el término de búsqueda,
    //la validación va a depender de la estructura que tenga la base de datos y de los propios datos en sí.

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name) updatePokemonDto.name.toLocaleLowerCase();

    //Si algunos de los parámetros que están configurados en el esquema com unicos,
    // se intentan modificar, entonces hay que indicar un error parsonalizado
    try {
      await pokemon.updateOne(updatePokemonDto, { new: true }); //El new:true es para que nos devuelva el nuevo objeto ( en este caso pokemon) actualizado
      const newPokemon = { ...pokemon.toJSON(), ...updatePokemonDto };
      return newPokemon;
    } catch (error: any) {
      this.handleExceptions(error);
    }

    //Validacion por el no
  }

  async remove(id: string) {
    // //const pokemonBD = await this.findOne( id );
    // // await pokemonBD.deleteOne()

    //const result = await this.pokemonModel.findByIdAndDelete( id );

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if (deletedCount === 0) throw new BadRequestException();
    return;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pkemon exists in db ${JSON.stringify(error.keyValue)}`,
      );
    }
    throw new BadRequestException(`Something went wrong, check server logs`);
  }
}
