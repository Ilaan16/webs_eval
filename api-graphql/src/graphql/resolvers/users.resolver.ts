import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UsersService } from '../../users/users.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/graphql-auth.guard';

@Resolver('User')
@UseGuards(GqlAuthGuard)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query('listUsers')
  async listUsers(@Args('skip') skip?: number, @Args('limit') limit?: number) {
    return this.usersService.findAll({ skip, limit });
  }

  @Query('user')
  async getUser(@Args('id') id: number) {
    return this.usersService.findOne(id);
  }

  // La mutation login sera gérée dans un resolver d'authentification séparé
  // car elle ne nécessite pas d'authentification (évidemment)
} 