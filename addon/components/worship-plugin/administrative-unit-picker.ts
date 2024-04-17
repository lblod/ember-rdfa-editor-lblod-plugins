import Component from '@glimmer/component';
import { restartableTask, timeout } from 'ember-concurrency';
import { AdministrativeUnit } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/worship-plugin';
import { fetchAdministrativeUnits } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/worship-plugin/utils/fetchAdministrativeUnits';
import { WorshipPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/worship-plugin';

interface Args {
  config: WorshipPluginConfig;
  selectedUnit?: AdministrativeUnit;
  onSelectUnit: (unit: AdministrativeUnit) => void;
}

export default class AdministrativeUnitPickerComponent extends Component<Args> {
  searchUnits = restartableTask(async (search: string) => {
    await timeout(200);

    const abortController = new AbortController();
    try {
      const units = await fetchAdministrativeUnits({
        search,
        config: this.args.config,
        abortSignal: abortController.signal,
      });

      return units;
    } catch (err) {
      // ember-power-select doesn't seem to have a way to display errors.
      console.error(
        'Error occured when searching for administrative units',
        err,
      );
      // We just re-throw to keep TS happy, ember-concurrency just swallows it.
      throw err;
    } finally {
      abortController.abort();
    }
  });
}
