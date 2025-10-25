import { environment } from "../environments/environment";

export enum RoutePaths {
    home = '',
    posts = 'posts',
    post = 'post',
    notFound = '404',
    credits = 'credits',
    about = 'about',
}

export const BACKEND_POST_SPECIFIC_STYLESHEET = "https://gateway.vip3rtech6069.com/wp-content/uploads/elementor/css/post-{id}.css";
export const AUTHOR_IMAGE_PLACEHOLDER="/images/common/image_placeholder.jpg";
export const FEATURED_IMAGE_PLACEHOLDER="/images/common/image_placeholder.jpg";

// Repository urls
export const infrastructureRepoUrl = "https://github.com/zuhairmhtb/ThePortfolioInfrastructure.git";
export const angularRepoUrl = "https://github.com/zuhairmhtb/ThePortfolioFrontend.git";
export const wordpressRepoUrl = "https://github.com/zuhairmhtb/ThePortfolioCMS.git";


export const GraphQLClients = {
    default: {
        name: 'default',
        uri: environment.ADMIN_GITHUB_API,
    },
    github: {
        name: 'github',
        uri: environment.ADMIN_GITHUB_API,
    },
};
export const ADMIN_BACKEND_API = environment.ADMIN_BACKEND_API;
export const ADMIN_BACKEND_XCSRF_KEY = "X-CSRFToken";


export function singularize(n:number, singular:string, plural:string|null=null):string {
    return n === 1 ? singular :
        plural ? plural : singular + 's';
}

export function getPostPublishDateReadable(postDate:Date):string {
    if(!postDate) return "";
    const now = new Date();
    if(!postDate) return "";
    const diff = now.getTime() - postDate.getTime();
    if(diff < 0) return "";
    if(diff < 1000) return "Just now";
    const seconds = Math.floor(diff / 1000);
    if(diff < 60000) return seconds + singularize(seconds, " second") + " ago";
    const minutes = Math.floor(diff / 60000);
    if(diff < 3600000) return minutes + singularize(minutes, " minute") + " ago";
    const hours = Math.floor(diff / 3600000);
    if(diff < 86400000) return hours + singularize(hours, " hour") + " ago";
    const days = Math.floor(diff / 86400000);
    if(diff < 604800000) return days + singularize(days, " day") + " ago";
    const weeks = Math.floor(diff / 604800000);
    if(diff < 2592000000) return weeks + singularize(weeks, " week") + " ago";
    const months = Math.floor(diff / 2592000000);
    if(diff < 31536000000) return months + singularize(months, " month") + " ago";
    const years = Math.floor(diff / 31536000000);
    return years + singularize(years, " year") + " ago";
}

export const sessionidKey = "mps-sessionid";