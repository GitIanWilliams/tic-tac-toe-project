import { Module } from '@nestjs/common';
import { MatchmakerGateway } from './matchmaker.gateway';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [GameModule],
  providers: [MatchmakerGateway],
})
export class MatchmakerModule {}
