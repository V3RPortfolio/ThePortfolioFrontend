import { ApolloLink, createHttpLink, InMemoryCache } from "@apollo/client/core";
import { GraphQLClients, ADMIN_BACKEND_XCSRF_KEY } from '../app.constants';
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import { setContext } from "@apollo/client/link/context";
import { HttpClient } from "@angular/common/http";

export class ApolloService {

    static async getCsrfToken(url:string, http:HttpClient):Promise<string> {
        /**
         * 
         * Retrieves CSRF Token from backend
         * @param {string} url - URL to fetch CSRF Token from
         */
        const currentKey = localStorage.getItem(ADMIN_BACKEND_XCSRF_KEY);
        if(currentKey) return currentKey;
        const response = await firstValueFrom(http.get(url,{withCredentials: true} ));
        if(!response || !response['csrfToken']) return "";
        localStorage.setItem(ADMIN_BACKEND_XCSRF_KEY, response['csrfToken']);
        return response['csrfToken'];
    }

    static getCsrfTokenMiddleware(tokenUrl:string, http:HttpClient):ApolloLink {
        /**
         * 
         * Returns middleware to retrieve CSRF Token
         * @param {string} tokenUrl - URL to fetch CSRF Token from
         */
        const auth = setContext(async (_, { headers }) => {
            const csrfToken = await ApolloService.getCsrfToken(tokenUrl, http);
            console.log(headers);
            return {
                headers: {
                    ...headers,
                    'x-CSRFToken': csrfToken
                }
            };
        });
        return auth;
    }

    static getGithubApolloClient(http:HttpClient):{link: ApolloLink, cache: InMemoryCache, credentials?:string} {
        /**
         * 
         * Returns Apollo Client for Github
         */
        return {
            link: ApolloLink.from([
                ApolloService.getCsrfTokenMiddleware(environment.ADMIN_CSRF_API, http),
                createHttpLink({
                    uri: GraphQLClients.github.uri,//GraphQLClients.github.uri,
                    credentials: 'include'
                    
                })
            ]),
            cache: new InMemoryCache(),
        };
    }

    static getDefaultApolloClient():{link: ApolloLink, cache: InMemoryCache} {
        /**
         * 
         * Returns default Apollo Client
         */
        return {
            link: createHttpLink({
                uri: GraphQLClients.default.uri
            }),
            cache: new InMemoryCache(),
        };
    }
}