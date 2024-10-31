import { Injectable } from "@angular/core";
import { gql, Query } from "apollo-angular";
import { GithubIssueMetric } from "../../interfaces/djadmin/github.interface";
import { GraphQLClients } from "../../app.constants";

@Injectable({
    providedIn: "root"
})
export class GithubIssueMetricGQL extends Query<GithubIssueMetric[]> {
    public fieldName: string = "issueCounts";
    document = gql`
        query {
            ${this.fieldName} {
                repository
                open
                closed
                all
                title
                description
                icon
                url
            }
        }
    `;
    override client: string = GraphQLClients.github.name;
}