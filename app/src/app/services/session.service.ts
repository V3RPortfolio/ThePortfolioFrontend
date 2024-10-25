import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class SessionManager {
    private sessionidKey = "mps-sessionid";
    private sessionCookieSaveDays = 365;

    checkCookieExists(name:string) {
        return document.cookie.split(';').filter((item) => item.trim().startsWith(name + '=')).length > 0;
    }

    addCookie(name:string, valueL:string, expires_days:number) {
        const date = new Date();
        date.setTime(date.getTime() + (expires_days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + valueL + ";" + expires + ";path=/";
    }

    private generateRandomId():string {
        return Math.floor(Math.random() * 1e32).toString();
    }

    setSessionId() {
        if(!this.checkCookieExists(this.sessionidKey)) {
            this.addCookie(this.sessionidKey, this.generateRandomId(), this.sessionCookieSaveDays);
        }
    }

    get sessionExists() {
        return this.checkCookieExists(this.sessionidKey);
    }
}