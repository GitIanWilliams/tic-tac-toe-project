import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { MatchmakerModule } from './matchmaker/matchmaker.module';

@Module({
  imports: [GameModule, MatchmakerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
