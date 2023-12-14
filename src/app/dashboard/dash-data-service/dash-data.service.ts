import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class DashDataService {

  private deviceIDSubject: BehaviorSubject<string | null>;
  public deviceID$: Observable<string | null>;
  private deviceNameSubject: BehaviorSubject<string | null>;
  public deviceName$: Observable<string | null>;
  private intervalSubject: BehaviorSubject<string | null>;
  public interval$: Observable<string | null>;
  private TypeSubject: BehaviorSubject<string | null>;
  public deviceType$: Observable<string | null>;
  private StartDateSubject: BehaviorSubject<string | null>;
  public StartDate$: Observable<string | null>;
  private EndDateSubject: BehaviorSubject<string | null>;
  public EndDate$: Observable<string | null>;

  constructor(private http: HttpClient, private router: Router) {
    this.deviceIDSubject = new BehaviorSubject<string | null>(this.getDeviceId());
    this.deviceID$ = this.deviceIDSubject.asObservable();
    this.deviceNameSubject = new BehaviorSubject<string | null>(this.getDeviceName());
    this.deviceName$ = this.deviceNameSubject.asObservable();
    this.intervalSubject = new BehaviorSubject<string | null>(this.getInterval());
    this.interval$ = this.intervalSubject.asObservable();
    this.TypeSubject = new BehaviorSubject<string | null>(this.getdeviceType());
    this.deviceType$ = this.TypeSubject.asObservable();
    this.StartDateSubject = new BehaviorSubject<string | null>(this.getStartDate());
    this.StartDate$ = this.StartDateSubject.asObservable();
    this.EndDateSubject = new BehaviorSubject<string | null>(this.getEndDate());
    this.EndDate$ = this.EndDateSubject.asObservable();
  }

  setDeviceId(deviceID: string) {
    sessionStorage.setItem('deviceID', deviceID);
    this.deviceIDSubject.next(deviceID);
  }

  setDeviceName(deviceName: string) {
    sessionStorage.setItem('deviceName', deviceName);
    this.deviceNameSubject.next(deviceName);
  }  

  setDeviceType(deviceType: string) {
    sessionStorage.setItem('deviceType', deviceType);
    this.TypeSubject.next(deviceType);
  }

  setInterval(interval: string) {
    sessionStorage.setItem('interval', interval);
    this.intervalSubject.next(interval);
  }

  setStartDate(StartDate: string) {
    sessionStorage.setItem('StartDate', StartDate);
    this.StartDateSubject.next(StartDate);
  }

  setEndDate(EndDate: string) {
    sessionStorage.setItem('EndDate', EndDate);
    this.EndDateSubject.next(EndDate);
  }

  getDeviceId(): string | null {
    return sessionStorage.getItem('deviceID');
  }

  getDeviceName(): string | null {
    return sessionStorage.getItem('deviceName');
  }

  getdeviceType(): string | null {
    return sessionStorage.getItem('deviceType');
  }
  
  getInterval(): string | null {
    return sessionStorage.getItem('interval');
  }

  getStartDate(): string | null {
    return sessionStorage.getItem('StartDate');
  }

  getEndDate(): string | null {
    return sessionStorage.getItem('EndDate');
  }

  deleteDevice(deviceUid: string) {
    throw new Error('Method not implemented.');
  }

  //private readonly API_URL = 'http://ec2-13-127-141-210.ap-south-1.compute.amazonaws.com:3000';
  private readonly API_URL = 'http://localhost:3000';

  userDevices(CompanyEmail: string): Observable<any> {
    return this.http.get(`${this.API_URL}/userdevices/${CompanyEmail}`);
  }
  
  editDevice(deviceId: string, DeviceData:any):Observable<any> {
    return this.http.put(`${this.API_URL}/editDevice/${deviceId}`, DeviceData)
  }

  fetchTriggerAll(CompanyEmail: string):Observable<any> {
    return this.http.get(`${this.API_URL}/user-devices-trigger/${CompanyEmail}`);
  }
  

  updateDeviceTrigger(deviceId: string, triggerData:any): Observable<any> {
    return this.http.put(`${this.API_URL}/editDeviceTrigger/${deviceId}`, triggerData);
  }

  dataLast(deviceId:string, interval: any): Observable<any> {
    return this.http.get(`${this.API_URL}/data/${deviceId}/intervals?interval=${interval}`);
  }

  DataByCustomDate(deviceId: string, startDate: any, endDate: any): Observable<any> {
    const params = { start: startDate, end: endDate };
    return this.http.get(`${this.API_URL}/data/${deviceId}`, { params });
  }

  dataLastStatus(deviceId:string, interval: any): Observable<any> {
    return this.http.get(`${this.API_URL}/dataStatus/${deviceId}/intervals?interval=${interval}`);
  }

  DataByCustomDateStatus(deviceId: string, startDate: any, endDate: any): Observable<any> {
    const params = { start: startDate, end: endDate };
    return this.http.get(`${this.API_URL}/dataStatus/${deviceId}`, { params });
  }

  deviceDetails(deviceId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/live-device-detail/${deviceId}`);
  }

  deviceStatus(deviceId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/live-device-status/${deviceId}`);
  }

  deviceTrigger(deviceId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/device-trigger/${deviceId}`);
  }

  userDetails(userId: string):Observable<any> {
    return this.http.get(`${this.API_URL}/user-data/${userId}`);
  }

  userMessages(receiver: string): Observable<any> {
    return this.http.get(`${this.API_URL}/messages/${receiver}`);
  }

  updatePersonal(userId: string, PersonalData:any): Observable<any>{
    return this.http.put(`${this.API_URL}/personalDetails/${userId}`, PersonalData);
  }

  updateCompany(UserId: string, CompanyData:any): Observable<any>{
    return this.http.put(`${this.API_URL}/companyDetails/${UserId}`, CompanyData);
  }

  updatePassword(userId: string, Password:any): Observable<any>{
    return this.http.put(`${this.API_URL}/updatePassword/${userId}`, Password);
  }

  companyUsers(CompanyEmail: string): Observable<any>{
    return this.http.get(`${this.API_URL}/Company-users/${CompanyEmail}`);
  }

  addDeviceTrigger(triggerData: any):Observable<any> {
    return this.http.post(`${this.API_URL}/addDeviceTrigger`, triggerData);
  }

  addDevice(deviceData: any):Observable<any> {
    return this.http.post(`${this.API_URL}/addDevice`, deviceData);
  }

  addUser(userRegister: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register-dashboard`, userRegister);
  }
  getDevicecount(): Observable<any> {
    return this.http.get(`${this.API_URL}/devInfo`);
  }


  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/removeUser/${userId}`);
  }


  getTodayConsumption(CompanyEmail: string): Observable<any> {
    return this.http.get(`${this.API_URL}/Total-Volume-Today-Email/${CompanyEmail}`);
  }

  getMonthConsumption(CompanyEmail: string): Observable<any> {
    return this.http.get(`${this.API_URL}/Total-Volume-Month-Email/${CompanyEmail}`);
  }
  
  getIntervalConsuption( deviceId : string, duration: any ): Observable <any>{
    return this.http.get(`${this.API_URL}/ConsuptionByIntervalBar/${deviceId}?duration=${duration}`);
  }

  getCustomConsumption(deviceId: string, startDate:any, endDate: any): Observable <any>{
    return this.http.get(`${this.API_URL}/ConsuptionByCustomBar/${deviceId}/${startDate}/${endDate}`);
  }
}
