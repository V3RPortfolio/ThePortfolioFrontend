export interface GithubIssueMetric {
    repository:string;
    url:string;
    open:number;
    closed:number;
    all:number;
    description?:string;
    title?:string;
    icon?:string;
}


