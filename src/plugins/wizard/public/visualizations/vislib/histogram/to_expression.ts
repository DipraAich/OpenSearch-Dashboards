/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vis, buildVislibDimensions } from '../../../../../visualizations/public';
import { buildExpression, buildExpressionFunction } from '../../../../../expressions/public';
import { HistogramOptionsDefaults } from './histogram_vis_type';
import { getAggExpressionFunctions } from '../../common/expression_helpers';
import { VislibRootState } from '../common/types';
import { getValueAxes } from '../common/get_value_axes';

export const toExpression = async ({
  style: styleState,
  visualization,
}: VislibRootState<HistogramOptionsDefaults>) => {
  const { aggConfigs, expressionFns } = await getAggExpressionFunctions(visualization);
  const { addLegend, addTooltip, legendPosition, type } = styleState;
  const pipelineConfigs = {
    // todo: this will blow up for time x dimensions
    timefilter: null, // todo: get the time filter from elsewhere
  };

  const vis = new Vis(type);
  vis.data.aggs = aggConfigs;

  const dimensions = await buildVislibDimensions(vis, pipelineConfigs as any);
  const valueAxes = getValueAxes(dimensions.y);

  // TODO: what do we want to put in this "vis config"?
  const visConfig = {
    addLegend,
    legendPosition,
    addTimeMarker: false,
    addTooltip,
    dimensions,
    valueAxes,
  };

  const vislib = buildExpressionFunction<any>('vislib', {
    type,
    visConfig: JSON.stringify(visConfig),
  });

  return buildExpression([...expressionFns, vislib]).toString();
};
