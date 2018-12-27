import fetch from 'node-fetch';
import { LocalSettings } from 'typings/settings';

class UpdateChecker {

    start(settings: LocalSettings, announce: Function){
        this.checkUpdate(settings, announce);
        setTimeout(this.checkUpdate.bind(this, settings, announce), settings.updateCheckFreq*60*1000);
    }

    private async checkUpdate(settings: LocalSettings, announce: Function){

        const res = await fetch(settings.releasesEndpoint);

        try{
            const releases = JSON.parse(await res.text());
            announce(releases);
        } catch ( e ){
            // DO NOTHING
        }
    }
}

export const updateChecker = new UpdateChecker();