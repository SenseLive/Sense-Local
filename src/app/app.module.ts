import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EncrptService } from './services/encrpt.service'

import { HttpClientModule } from '@angular/common/http';
import { MqttModule, IMqttServiceOptions } from 'ngx-mqtt';

import { HashLocationStrategy,LocationStrategy } from '@angular/common';

const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: 'broker.emqx.io',
  port: 8083,
  protocol: 'ws',
  path: '/mqtt',
};


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    
  ],
  providers: [EncrptService,{provide : LocationStrategy , useClass : HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }