import { DefaultUrlSerializer, UrlSerializer, UrlTree } from '@angular/router';

export class CustomUrlSerializer extends DefaultUrlSerializer {
    private sanitize(value: string): string {
        // Basic sanitization example: replace spaces with hyphens, remove special characters
        return value.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    }

    override parse(url: string): UrlTree {
        const sanitizedUrl = url.split('/').map(this.sanitize).join('/');
        return super.parse(sanitizedUrl);
    }

    override serialize(tree: UrlTree): string {
        const url = decodeURI(super.serialize(tree));
        let serializedUrl = url.split('/').map(this.sanitize).join('/');
        return serializedUrl;
    }
}