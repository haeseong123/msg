import { Column, Index } from "typeorm";

@Index(['emailLocal', 'emailDomain'], { unique: true })
export class EmailInfo {
    @Column({ name: 'email_local', type: 'varchar', length: 64 })
    emailLocal: string;

    @Column({ name: 'email_domain', type: 'varchar', length: 255 })
    emailDomain: string;

    static of(
        emailLocal: string,
        emailDomain: string,
    ): EmailInfo {
        const email = new EmailInfo();
        email.emailLocal = emailLocal;
        email.emailDomain = emailDomain;

        return email;
    }

    get email(): string {
        return this.emailLocal + '@' + this.emailDomain;
    }
}